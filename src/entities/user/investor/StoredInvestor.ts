import { IStoredUser, IStoredInvestment, StoredUser } from '@entities';
import { IStoredRequest } from 'src/entities/investment/request/StoredRequest';
import { IPersistedInvestor } from './PersistedInvestor';

export interface IStoredInvestor extends IStoredUser {
    portfolioValue: number;
}

export class StoredInvestor extends StoredUser implements IStoredInvestor {

    public portfolioValue: number;


    constructor(id: number | IPersistedInvestor, portfolioValue: number,
        // tslint:disable-next-line: align
        name?: string, email?: string, pwdHash?: string) {
        super(id, name, email, pwdHash);
        if (portfolioValue) {
            this.portfolioValue = portfolioValue;
        } else {
            this.portfolioValue = portfolioValue;
        }
    }

}
