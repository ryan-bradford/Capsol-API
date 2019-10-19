import { IPersistedHomeowner, IPersistedContract, StorableContract, IStorableHomeowner } from '@entities';
import { IUserDao, IContractDao } from '@daos';
import { IRequestService } from '@services';
import { logger } from '@shared';

export interface IContractService {
    createContract(amount: number, userId: string):
        Promise<IPersistedContract>;
    makePayment(email: string): Promise<number | null>;
}

export class ContractService implements IContractService {


    constructor(
        private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
        private contractDao: IContractDao,
        private requestService: IRequestService) { }


    public async createContract(amount: number, userId: string):
        Promise<IPersistedContract> {
        const homeowner = await this.homeownerDao.getOne(userId);
        if (!homeowner) {
            throw new Error('Not found');
        }
        const interestRate = 0.04;
        const lengthInYears = 20;
        const yearlyPayment = amount * (1 / 20 + interestRate);
        const newContract = new StorableContract(amount, lengthInYears * 12, yearlyPayment / 12, homeowner.id);
        const toReturn = await this.contractDao.createContract(newContract);
        return toReturn;
    }


    public async makePayment(email: string): Promise<number | null> {
        const user = await this.homeownerDao.getOneByEmail(email);
        if (user && user.id) {
            const contracts = await this.contractDao.getContracts(user.id);
            if (contracts.length !== 1) {
                throw new Error('Bad request');
            }
            const contract = contracts[0];
            if (!contract.isFulfilled || !contract.length) {
                return null;
            }
            await Promise.all(contract.investments.map(async (investment) => {
                await this.requestService.createPurchaseRequest(investment.owner,
                    investment.amount / contract.saleAmount * contract.monthlyPayment);
                return;
            }));
            contract.length -= 1;
            await this.contractDao.saveContract(contract);
            return contract.monthlyPayment;
            return 1;
        } else {
            throw new Error('Not found');
        }
    }
}
