/**
 * Stores all the information that should be made public about a cash deposit.
 */
export interface IStoredCashDeposit {
    /**
     * The amount that was deposited.
     *
     * @invariant amount >= 0
     */
    amount: number;
    /**
     * The month this amount was deposited on as a number.
     */
    date: number;
    /**
     * The UUID of this cash deposit.
     *
     * @unique
     */
    id: string;
    /**
     * The UUID of the user who made this deposit.
     */
    userId: string;
}

export class StoredCashDeposit implements IStoredCashDeposit {
    public amount: number;
    public date: number;

    public id: string;
    public userId: string;


    constructor(id: string, amount: number, date: number, userId: string) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.userId = userId;
    }


}
