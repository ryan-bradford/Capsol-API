import {
    IPersistedInvestment, IPersistedInvestor, IStorableInvestor, PersistedRequest,
} from '@entities';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { IRequestService, RequestService } from '@services';
import { IUserDao } from '@daos';
import { SqlInvestorDao } from 'src/daos/user/InvestorDao';
import { getRepository } from 'typeorm';
import { logger } from '@shared';

export interface IInvestmentService {
    addFunds(userId: number, amount: number): Promise<IPersistedInvestment[]>;
    sellInvestments(userId: number, amount: number): Promise<void>;
    getPortfolioValue(userId: number): Promise<number>;
}

export class InvestmentService implements IInvestmentService {


    constructor(
        private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        private requestService: IRequestService) { }


    public async addFunds(userId: number, amount: number): Promise<IPersistedInvestment[]> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new Error('Not found');
        }
        await this.requestService.createPurchaseRequest(user, amount);
        return [];
    }


    public async sellInvestments(userId: number, amount: number): Promise<void> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new Error('Not found');
        }
        await this.requestService.createSellRequest(user, amount);
        return;
    }


    public async getPortfolioValue(userId: number): Promise<number> {
        const result = await getRepository(PersistedRequest)
            .createQueryBuilder('request')
            .where('request.investorId = :userId', { userId })
            .select('SUM(request.amount)')
            .getOne();
        return result as unknown as number;
    }

}
