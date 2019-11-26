import { Min, IsUUID } from 'class-validator';

/**
 * Stores all the information needed to create a request.
 */
export interface IStorableRequest {
    /**
     * The amount that the request asks for.
     */
    amount: number;
    /**
     * The month this request was made on.
     */
    dateCreated: number;
    /**
     * Whether this is a purchase or sell request.
     */
    type: 'purchase' | 'sell';
    /**
     * The ID of the investor who made this request.
     */
    userId: string;

}

export class StorableRequest implements IStorableRequest {

    @Min(0)
    public amount: number;

    @Min(0)
    public dateCreated: number;
    public type: 'purchase' | 'sell';

    @IsUUID()
    public userId: string;


    constructor(amount: number, dateCreated: number, userId: string, type: 'purchase' | 'sell') {
        this.amount = amount;
        this.dateCreated = dateCreated;
        this.userId = userId;
        this.type = type;
    }
}
