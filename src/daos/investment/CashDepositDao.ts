import { IPersistedInvestor, IPersistedCashDeposit, PersistedCashDeposit } from '@entities';
import { getRepository } from 'typeorm';
import { singleton } from 'tsyringe';

/**
 * `ICashDepositDao` is a database interface for dealing with cash deposits.
 */
export interface ICashDepositDao {

    /**
     * Gets all deposits that the given user has made.
     * Will not throw an error if the user does not exist.
     */
    getDepositsFor(user: IPersistedInvestor): Promise<IPersistedCashDeposit[]>;

    /**
     * Creates a deposit of the given amount for the given user.
     */
    makeDeposit(amount: number, date: number, user: IPersistedInvestor): Promise<void>;

}

/**
 * `SqlCashDepositDao` is a specific implementation of {@link ICashDepositDao} for interfacing with MySQL using TypeORM.
 */
@singleton()
export class SqlCashDepositDao implements ICashDepositDao {


    /**
     * @inheritdoc
     */
    public async getDepositsFor(user: IPersistedInvestor): Promise<IPersistedCashDeposit[]> {
        return getRepository(PersistedCashDeposit).find({ user });
    }


    /**
     * @inheritdoc
     */
    public async makeDeposit(amount: number, date: number, user: IPersistedInvestor): Promise<void> {
        const newCashDeposit = new PersistedCashDeposit();
        newCashDeposit.amount = amount;
        newCashDeposit.date = date;
        newCashDeposit.user = user;
        await getRepository(PersistedCashDeposit).insert(newCashDeposit);
    }

}
