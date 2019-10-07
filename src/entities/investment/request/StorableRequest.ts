import { IStoredUser } from '@entities';
import { IPersistedUser } from 'src/entities/user/user/PersistedUser';

export interface IStorableRequest {

    amount: number;
    userId: number;
    dateCreated: Date;

}

export abstract class AStorableRequest implements IStorableRequest {

    public amount: number;
    public dateCreated: Date;
    public userId: number;


    constructor(amount: number, dateCreated: Date, userId: number) {
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
    }
}
