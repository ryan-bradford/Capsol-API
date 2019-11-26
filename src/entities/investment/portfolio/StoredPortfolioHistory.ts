/**
 * Stores all the information that should be made public about a item in an investors portfolio history.
 */
export interface IStoredPortfolioHistory {
    /**
     * The amount of cash the user had deposited at this time.
     */
    cashDeposit: number;
    /**
     * The month this history item relates to.
     */
    month: number;
    /**
     * The total value of the investments at this time.
     */
    totalValue: number;
}

export class StoredPortfolioHistory implements IStoredPortfolioHistory {
    public cashDeposit: number;

    public month: number;
    public totalValue: number;


    constructor(month: number, cashDeposit: number, totalValue: number) {
        this.month = month;
        this.cashDeposit = cashDeposit;
        this.totalValue = totalValue;
    }


}
