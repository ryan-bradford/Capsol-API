export interface IStoredRequest {

    id: number;
    amount: number;
    userId: number;
    dateCreated: Date;
    type: 'purchase' | 'sell';

}

export class StoredRequest implements IStoredRequest {

    public id: number;
    public amount: number;
    public dateCreated: Date;
    public userId: number;
    public type: 'purchase' | 'sell';


    constructor(id: number, amount: number, dateCreated: Date, userId: number, type: 'purchase' | 'sell') {
        this.id = id;
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
        this.type = type;
    }
}
