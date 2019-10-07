import { IPersistedHomeowner, IStoredHomeowner, IPersistedContract, PersistedContract, StorableContract } from '@entities';
import { IUserDao, IContractDao } from '@daos';
import { assert } from 'console';
import { IRequestService } from '@services';

export interface IContractService {
    createContract(amount: number, interestRate: number, years: number, userId: number):
        Promise<IPersistedContract>;
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

}
