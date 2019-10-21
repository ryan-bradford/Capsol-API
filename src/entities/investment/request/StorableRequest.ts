import { IStoredUser } from '@entities';
import { IPersistedUser } from 'src/entities/user/user/PersistedUser';

export interface IStorableRequest {

    amount: number;
    userId: string;
    dateCreated: number;
    type: 'purchase' | 'sell';

}

export class StorableRequest implements IStorableRequest {

    public amount: number;
    public dateCreated: number;
    public userId: string;
    public type: 'purchase' | 'sell';


    constructor(amount: number, dateCreated: number, userId: string, type: 'purchase' | 'sell') {
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
        this.type = type;
    }
}
