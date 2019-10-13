import { IPersistedHomeowner, IStoredHomeowner, IPersistedContract, PersistedContract, StorableContract } from '@entities';
import { IUserDao, IContractDao } from '@daos';
import { IRequestService } from '@services';

export interface IContractService {
    createContract(amount: number, userId: number):
        Promise<IPersistedContract>;
    makePayment(email: string): Promise<void>;
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
        const months = 240;
        const interestRate = 0.04;
        const newContract = new StorableContract(amount, months, amount * interestRate, homeowner.id);
        const toReturn = await this.contractDao.createContract(newContract);
        await this.requestService.handleRequests();
        return toReturn;
    }


    public async makePayment(email: string): Promise<void> {
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
                await this.requestService.createPurchaseRequest(investment.owner.id,
                    investment.percentage * contract.monthlyPayment);
                return;
            }));
            contract.length -= 1;
            this.contractDao.saveContract(contract);
        } else {
            throw new Error('Not found');
        }
    }
}
