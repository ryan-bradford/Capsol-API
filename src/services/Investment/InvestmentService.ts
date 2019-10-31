import {
    IPersistedInvestment, IPersistedInvestor, IStorableInvestor, PersistedRequest, StorableRequest,
} from '@entities';
import { IUserDao, IInvestmentDao } from '@daos';
import { getRepository } from 'typeorm';
import { injectable, inject } from 'tsyringe';
import { ICashDepositDao } from 'src/daos/investment/CashDepositDao';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { ServiceError } from 'src/shared/error/ServiceError';

/**
 * All the actions that are needed for business operations on investments.
 */
export interface IInvestmentService {
    /**
     * Adds `amount` of funds to the investor represented by the given `userId`.
     *
     * @throws Error if the user was not found.
     */
    addFunds(userId: string, amount: number, date: number): Promise<IPersistedInvestment[]>;
    // TODO: implement second throws
    /**
     * Sells `amount` of funds from the investor represented by the given `userId`.
     *
     * @throws Error if the user was not found.
     * @throws Error if the investor does not have enough funds to sell.
     */
    sellInvestments(userId: string, amount: number, date: number): Promise<void>;
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
        @inject('RequestDao') private requestDao: IRequestDao,
        @inject('CashDepositDao') private cashDepositDao: ICashDepositDao) { }


    /**
     * @inheritdoc
     */
    public async addFunds(userId: string, amount: number, date: number): Promise<IPersistedInvestment[]> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new ServiceError(`User with ID ${userId} was not found.`);
        }
        amount = (await
            this.requestDao.createRequest(new StorableRequest(amount, date, user.id, 'purchase'))).amount;
        await this.cashDepositDao.makeDeposit(amount, date, user);
        return [];
    }


    /**
     * @inheritdoc
     */
    public async sellInvestments(userId: string, amount: number, date: number): Promise<void> {
        const user = await this.investorDao.getOne(userId);
        if (!user) {
            throw new ServiceError(`User with ID ${userId} was not found.`);
        }
        amount = (await
            this.requestDao.createRequest(new StorableRequest(amount, date, user.id, 'sell'))).amount;
        return;
    }


    /**
     * @inheritdoc
     */
    public async getCashValue(userId: string): Promise<number> {
        const requestValue = await getRepository(PersistedRequest)
            .createQueryBuilder('request')
            .where('request.investorId = :userId AND request.type = "purchase"', { userId })
            .select('SUM(request.amount)', 'sum')
            .getRawOne();
        return Number(requestValue.sum);
    }


    /**
     * @inheritdoc
     */
    public async getInvestmentsFor(userId: string): Promise<IPersistedInvestment[]> {
        return this.investmentDao.getInvestments(userId);
    }

}
