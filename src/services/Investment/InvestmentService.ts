import {
    IPersistedInvestment, IPersistedInvestor, IStorableInvestor, PersistedRequest,
    IPersistedCashDeposit, PersistedCashDeposit,
} from '@entities';
import { IRequestService } from '@services';
import { IUserDao, IInvestmentDao } from '@daos';
import { getRepository } from 'typeorm';
import { getDateAsNumber } from '@shared';
import { injectable, singleton, inject } from 'tsyringe';

export interface IInvestmentService {
    addFunds(userId: string, amount: number): Promise<IPersistedInvestment[]>;
    sellInvestments(userId: string, amount: number): Promise<void>;
    getCashValue(userId: string): Promise<number>;
    getInvestmentsFor(userId: string): Promise<IPersistedInvestment[]>;
    getAllCashDepositsFor(userId: string): Promise<IPersistedCashDeposit[]>;
}

@injectable()
export class InvestmentService implements IInvestmentService {


    constructor(
        @inject('InvestorDao') private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        @inject('InvestmentDao') private investmentDao: IInvestmentDao,
        @inject('RequestService') private requestService: IRequestService) { }


    public async addFunds(userId: string, amount: number): Promise<IPersistedInvestment[]> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new Error('Not found');
        }
        amount = await this.requestService.createPurchaseRequest(user, amount);
        const newCashDeposit = new PersistedCashDeposit();
        newCashDeposit.amount = amount;
        newCashDeposit.date = getDateAsNumber();
        newCashDeposit.user = user;
        getRepository(PersistedCashDeposit).save(newCashDeposit);
        return [];
    }


    public async sellInvestments(userId: string, amount: number): Promise<void> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new Error('Not found');
        }
        await this.requestService.createSellRequest(user, amount);
        return;
    }


    public async getCashValue(userId: string): Promise<number> {
        const requestValue = await getRepository(PersistedRequest)
            .createQueryBuilder('request')
            .where('request.investorId = :userId AND request.type = "purchase"', { userId })
            .select('SUM(request.amount)', 'sum')
            .getRawOne();
        return Number(requestValue.sum);
    }


    public async getInvestmentsFor(userId: string): Promise<IPersistedInvestment[]> {
        return this.investmentDao.getInvestments(userId);
    }


    public async getAllCashDepositsFor(userId: string): Promise<IPersistedCashDeposit[]> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new Error('Not found');
        }
        return getRepository(PersistedCashDeposit).find({ user });
    }

}
