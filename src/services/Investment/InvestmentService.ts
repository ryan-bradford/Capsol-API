import {
    IPersistedInvestment, IPersistedInvestor, IStorableInvestor, PersistedRequest, PersistedInvestment,
} from '@entities';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { IRequestService, RequestService } from '@services';
import { IUserDao, IInvestmentDao } from '@daos';
import { SqlInvestorDao } from 'src/daos/user/InvestorDao';
import { getRepository } from 'typeorm';
import { logger } from '@shared';

export interface IInvestmentService {
    addFunds(userId: string, amount: number): Promise<IPersistedInvestment[]>;
    sellInvestments(userId: string, amount: number): Promise<void>;
    getPortfolioValue(userId: string): Promise<number>;
}

export class InvestmentService implements IInvestmentService {


    constructor(
        private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        private investmentDao: IInvestmentDao,
        private requestService: IRequestService) { }


    public async addFunds(userId: string, amount: number): Promise<IPersistedInvestment[]> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new Error('Not found');
        }
        await this.requestService.createPurchaseRequest(user, amount);
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


    public async getPortfolioValue(userId: string): Promise<number> {
        const [requestValue, investments] = await Promise.all([getRepository(PersistedRequest)
            .createQueryBuilder('request')
            .where('request.investorId = :userId AND request.type = "purchase"', { userId })
            .select('SUM(request.amount)', 'sum')
            .getRawOne(),
        this.investmentDao.getInvestments(userId)]);
        let investmentValue = 0;
        investments.forEach((investment) => {
            investmentValue += investment.value;
        });
        return Number(requestValue.sum) + Number(investmentValue);
    }

}
