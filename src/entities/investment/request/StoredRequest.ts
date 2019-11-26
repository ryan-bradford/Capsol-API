/**
 * Stores all the information that should be made public about a request.
 */
export interface IStoredRequest {
    /**
     * The amount that the request asks for.
     */
    amount: number;
    /**
     * The month this request was made on.
     */
    dateCreated: number;
    /**
     * The UUID of the request.
     *
     * @unique
     */
    id: string;
    /**
     * Whether this is a purchase or sell request.
     */
    type: 'purchase' | 'sell';
    /**
     * The ID of the investor who made this request.
     */
    userId: string;

}

export class StoredRequest implements IStoredRequest {
    public amount: number;
    public dateCreated: number;

    public id: string;
    public type: 'purchase' | 'sell';
    public userId: string;


    constructor(id: string, amount: number, dateCreated: number, userId: string, type: 'purchase' | 'sell') {
        this.id = id;
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
        this.type = type;
    }
}
