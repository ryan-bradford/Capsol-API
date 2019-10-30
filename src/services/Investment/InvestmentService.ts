import {
    IPersistedInvestment, IPersistedInvestor, IStorableInvestor, PersistedRequest,
} from '@entities';
import { IRequestService } from '@services';
import { IUserDao, IInvestmentDao } from '@daos';
import { getRepository } from 'typeorm';
import { injectable, inject } from 'tsyringe';
import { ICashDepositDao } from 'src/daos/investment/CashDepositDao';

/**
 * All the actions that are needed for business operations on investments.
 */
export interface IInvestmentService {
    /**
     * Adds `amount` of funds to the investor represented by the given `userId`.
     *
     * @throws Error if the user was not found.
     */
    addFunds(userId: string, amount: number): Promise<IPersistedInvestment[]>;
    // TODO: implement second throws
    /**
     * Sells `amount` of funds from the investor represented by the given `userId`.
     *
     * @throws Error if the user was not found.
     * @throws Error if the investor does not have enough funds to sell.
     */
    sellInvestments(userId: string, amount: number): Promise<void>;
    /**
     * Returns the total amount of cash the given investor has uninvested.
     */
    getCashValue(userId: string): Promise<number>;
    /**
     * Returns every investment owned by the given investor.
     */
    getInvestmentsFor(userId: string): Promise<IPersistedInvestment[]>;
}

@injectable()
export class InvestmentService implements IInvestmentService {


    constructor(
        @inject('InvestorDao') private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        @inject('InvestmentDao') private investmentDao: IInvestmentDao,
        @inject('RequestService') private requestService: IRequestService,
        @inject('CashDepositDao') private cashDepositDao: ICashDepositDao) { }


    public async addFunds(userId: string, amount: number): Promise<IPersistedInvestment[]> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new Error('Not found');
        }
        amount = await this.requestService.createPurchaseRequest(user, amount);
        await this.cashDepositDao.makeDeposit(amount, user);
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

}
