import { IContract, Contract, Homeowner, IHomeowner } from '@entities';
import { IContractDao, IUserDao } from '@daos';

export interface IContractService {
    createContract(amount: number, interestRate: number, years: number, userId: number): Promise<IContract>;
}

export class ContractService implements IContractService {


    constructor(private homeownerDao: IUserDao<IHomeowner>) { }


    public async createContract(amount: number, interestRate: number, years: number, userId: number):
        Promise<IContract> {
        const homeowner = await this.homeownerDao.getOne(userId);
        if (!homeowner) {
            throw new Error('Not found');
        }
        return new Contract(amount, years, amount * interestRate, homeowner);
    }

}
