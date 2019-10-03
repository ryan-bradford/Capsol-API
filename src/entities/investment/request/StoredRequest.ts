export interface IStoredRequest {

    id: number;
    amount: number;
    userId: number;
    dateCreated: Date;

}

export abstract class AStoredRequest implements IStoredRequest {

    public id: number;
    public amount: number;
    public dateCreated: Date;
    public userId: number;


    constructor(id: number, amount: number, dateCreated: Date, userId: number) {
        this.id = id;
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
    }
}
