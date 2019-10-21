import { IStoredUser, IStoredInvestment, StoredUser, IStoredCashDeposit } from '@entities';
import { IStoredRequest } from 'src/entities/investment/request/StoredRequest';
import { IPersistedInvestor } from './PersistedInvestor';

export interface IStoredInvestor extends IStoredUser {
    totalCash: number;
    investments: IStoredInvestment[];
    cashDeposits: IStoredCashDeposit[];
}

export class StoredInvestor extends StoredUser implements IStoredInvestor {

    public totalCash: number;
    public investments: IStoredInvestment[];
    public cashDeposits: IStoredCashDeposit[];


    constructor(id: string | IPersistedInvestor, totalCash: number, investments: IStoredInvestment[],
        // tslint:disable-next-line: align
        cashDeposits: IStoredCashDeposit[], name?: string, email?: string, pwdHash?: string) {
        super(id, name, email, pwdHash);
        this.totalCash = totalCash;
        this.investments = investments;
        this.cashDeposits = cashDeposits;
    }

}
