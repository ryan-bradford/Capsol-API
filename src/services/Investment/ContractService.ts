import { IContract, Contract, Homeowner, IHomeowner, IUser } from '@entities';
import { IContractDao, IUserDao } from '@daos';
import { assert } from 'console';

export interface IContractService {
    createContract(amount: number, interestRate: number, years: number, user: IHomeowner): Promise<IContract>;
}

export class ContractService implements IContractService {


    constructor(private homeownerDao: IUserDao<IHomeowner>) { }


    public async createContract(amount: number, interestRate: number, years: number, user: IHomeowner):
        Promise<IContract> {
        assert(user.id !== undefined);
        const homeowner = await this.homeownerDao.getOne(user.id as number);
        if (!homeowner) {
            throw new Error('Not found');
        }
        const toReturn = new Contract();
        toReturn.saleAmount = amount;
        toReturn.length = years;
        toReturn.monthlyPayment = amount * interestRate;
        toReturn.homeowner = homeowner;
        return toReturn;
    }

}
