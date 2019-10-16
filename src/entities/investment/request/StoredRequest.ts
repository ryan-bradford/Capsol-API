export interface IStoredRequest {

    id: string;
    amount: number;
    userId: string;
    dateCreated: Date;
    type: 'purchase' | 'sell';

}

export class StoredRequest implements IStoredRequest {

    public id: string;
    public amount: number;
    public dateCreated: Date;
    public userId: string;
    public type: 'purchase' | 'sell';


    constructor(id: string, amount: number, dateCreated: Date, userId: string, type: 'purchase' | 'sell') {
        this.id = id;
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
        this.type = type;
    }
}
