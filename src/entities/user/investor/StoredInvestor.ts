import { IStoredUser, IStoredInvestment, StoredUser } from '@entities';
import { IStoredRequest } from 'src/entities/investment/request/StoredRequest';

export interface IStoredInvestor extends IStoredUser {
    portfolioValue: number;
}

export class StoredInvestor extends StoredUser implements IStoredInvestor {

    public portfolioValue: number;


    constructor(id: number, name: string, email: string, pwdHash: string,
        // tslint:disable-next-line: align
        portfolioValue: number) {
        super(id, name, email, pwdHash, []);
        this.portfolioValue = portfolioValue;
    }

}
