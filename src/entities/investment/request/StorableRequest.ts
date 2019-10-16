import { IStoredUser } from '@entities';
import { IPersistedUser } from 'src/entities/user/user/PersistedUser';

export interface IStorableRequest {

    amount: number;
    userId: string;
    dateCreated: Date;
    type: 'purchase' | 'sell';

}

export class StorableRequest implements IStorableRequest {

    public amount: number;
    public dateCreated: Date;
    public userId: string;
    public type: 'purchase' | 'sell';


    constructor(amount: number, dateCreated: Date, userId: string, type: 'purchase' | 'sell') {
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
        this.type = type;
    }
}
