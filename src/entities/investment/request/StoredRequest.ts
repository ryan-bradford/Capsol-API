/**
 * Stores all the information that should be made public about a request.
 */
export interface IStoredRequest {
    /**
     * The UUID of the request.
     *
     * @unique
     */
    id: string;
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

export class StoredRequest implements IStoredRequest {

    public id: string;
    public amount: number;
    public dateCreated: number;
    public userId: string;
    public type: 'purchase' | 'sell';


    constructor(id: string, amount: number, dateCreated: number, userId: string, type: 'purchase' | 'sell') {
        this.id = id;
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
        this.type = type;
    }
}
