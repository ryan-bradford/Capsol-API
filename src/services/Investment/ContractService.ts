import { IPersistedHomeowner, IStoredHomeowner, IPersistedContract, PersistedContract } from '@entities';
import { IUserDao } from '@daos';
import { assert } from 'console';

export interface IContractService {
    createContract(amount: number, interestRate: number, years: number, user: IPersistedHomeowner):
        Promise<IPersistedContract>;
}

export class ContractService implements IContractService {


    constructor(private homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>) { }


    public async createContract(amount: number, interestRate: number, years: number, user: IPersistedHomeowner):
        Promise<IPersistedContract> {
        assert(user.id !== undefined);
        const homeowner = await this.homeownerDao.getOne(user.id as number);
        if (!homeowner) {
            throw new Error('Not found');
        }
        const toReturn = new PersistedContract();
        toReturn.saleAmount = amount;
        toReturn.length = years;
        toReturn.monthlyPayment = amount * interestRate;
        toReturn.homeowner = homeowner;
        return toReturn;
    }

}
