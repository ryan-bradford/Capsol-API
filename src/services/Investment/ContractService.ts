import { IPersistedHomeowner, IStoredHomeowner, IPersistedContract, PersistedContract, StorableContract } from '@entities';
import { IUserDao, IContractDao } from '@daos';
import { IRequestService } from '@services';
import { logger } from '@shared';

export interface IContractService {
    createContract(amount: number, userId: number):
        Promise<IPersistedContract>;
    makePayment(email: string): Promise<number>;
}

export class ContractService implements IContractService {


    constructor(
        private homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
        private contractDao: IContractDao,
        private requestService: IRequestService) { }


    public async createContract(amount: number, userId: number):
        Promise<IPersistedContract> {
        const homeowner = await this.homeownerDao.getOne(userId);
        if (!homeowner) {
            throw new Error('Not found');
        }
        const interestRate = 0.04;
        const lengthInYears = 20;
        const yearlyPayment = amount * (1 / 20 + interestRate);
        // const lengthInYears = (1 / interestRate * amount) / (amount + 1 / interestRate * yearlyPayment);
        const newContract = new StorableContract(amount, lengthInYears * 12, yearlyPayment / 12, homeowner.id);
        const toReturn = await this.contractDao.createContract(newContract);
        await this.requestService.handleRequests();
        return toReturn;
    }


    public async makePayment(email: string): Promise<number> {
        const user = await this.homeownerDao.getOne(email);
        if (user && user.id) {
            const contracts = await this.contractDao.getContracts(user.id);
            if (contracts.length !== 1) {
                throw new Error('Bad request');
            }
            const contract = contracts[0];
            if (!contract.isFulfilled || !contract.length) {
                throw new Error('No payment needed');
            }
            await Promise.all(contract.investments.map(async (investment) => {
                await this.requestService.createPurchaseRequest(investment.owner,
                    investment.percentage * contract.monthlyPayment);
                return;
            }));
            contract.length -= 1;
            await this.contractDao.saveContract(contract);
            return contract.monthlyPayment;
        } else {
            throw new Error('Not found');
        }
    }
}
