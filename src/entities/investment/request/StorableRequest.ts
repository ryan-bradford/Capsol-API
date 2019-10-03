import { IStoredUser } from '@entities';
import { IPersistedUser } from 'src/entities/user/user/PersistedUser';

export interface IStorableRequest {

    amount: number;
    user: IPersistedUser;
    dateCreated: Date;

}

export abstract class AStorableRequest implements IStorableRequest {

    public amount: number;
    public dateCreated: Date;
    public user: IPersistedUser;


    constructor(amount: number, dateCreated: Date, user: IPersistedUser) {
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.user = user;
    }
}
