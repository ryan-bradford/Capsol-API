/**
 * Stores all the information needed to create a request.
 */
export interface IStorableRequest {
    /**
     * The amount that the request asks for.
     */
    amount: number;
    /**
     * The ID of the investor who made this request.
     */
    userId: string;
    /**
     * The month this request was made on.
     */
    dateCreated: number;
    /**
     * Whether this is a purchase or sell request.
     */
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
