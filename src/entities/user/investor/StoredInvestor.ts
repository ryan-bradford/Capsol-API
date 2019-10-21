import { IStoredUser, IStoredInvestment, StoredUser } from '@entities';
import { IStoredRequest } from 'src/entities/investment/request/StoredRequest';
import { IPersistedInvestor } from './PersistedInvestor';

export interface IStoredInvestor extends IStoredUser {
    totalCash: number;
    investments: IStoredInvestment[];
}

export class StoredInvestor extends StoredUser implements IStoredInvestor {

    public totalCash: number;
    public investments: IStoredInvestment[];


    constructor(id: string | IPersistedInvestor, totalCash: number, investments: IStoredInvestment[],
        // tslint:disable-next-line: align
        name?: string, email?: string, pwdHash?: string) {
        super(id, name, email, pwdHash);
        this.totalCash = totalCash;
        this.investments = investments;
    }

}
