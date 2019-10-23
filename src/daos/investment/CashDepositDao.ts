import { IPersistedInvestor, IPersistedCashDeposit, PersistedCashDeposit } from '@entities';
import { getDateAsNumber, logger } from '@shared';
import { getRepository } from 'typeorm';
import { singleton } from 'tsyringe';

export interface ICashDepositDao {

    makeDeposit(amount: number, user: IPersistedInvestor): Promise<void>;
    getDepositsFor(user: IPersistedInvestor): Promise<IPersistedCashDeposit[]>;

}

@singleton()
export class SqlCashDepositDao implements ICashDepositDao {


    public async makeDeposit(amount: number, user: IPersistedInvestor): Promise<void> {
        const newCashDeposit = new PersistedCashDeposit();
        newCashDeposit.amount = amount;
        newCashDeposit.date = getDateAsNumber();
        newCashDeposit.user = user;
        getRepository(PersistedCashDeposit).save(newCashDeposit);
    }


    public async getDepositsFor(user: IPersistedInvestor): Promise<IPersistedCashDeposit[]> {
        return getRepository(PersistedCashDeposit).find({ user });
    }

}
