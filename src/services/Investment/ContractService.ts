import { IPersistedHomeowner, IStoredHomeowner, IPersistedContract, PersistedContract, StorableContract } from '@entities';
import { IUserDao, IContractDao } from '@daos';
import { IRequestService } from '@services';

export interface IContractService {
    createContract(amount: number, interestRate: number, years: number, userId: number):
        Promise<IPersistedContract>;
    makePayment(email: string): Promise<void>;
}

export class ContractService implements IContractService {


    constructor(
        private homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
        private contractDao: IContractDao,
        private requestService: IRequestService) { }


    public async createContract(amount: number, interestRate: number, years: number, userId: number):
        Promise<IPersistedContract> {
        const homeowner = await this.homeownerDao.getOne(userId);
        if (!homeowner) {
            throw new Error('Not found');
        }
        const newContract = new StorableContract(amount, years, amount * interestRate, homeowner.id);
        const toReturn = await this.contractDao.createContract(newContract);
        await this.requestService.createSellRequest(homeowner.id, toReturn.saleAmount);
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
            await Promise.all(contract.investments.map(async (investment) => {
                await this.requestService.createPurchaseRequest(investment.owner.id,
                    investment.percentage * contract.monthlyPayment);
                return;
            }));
        } else {
            throw new Error('Not found');
        }
    }
}
