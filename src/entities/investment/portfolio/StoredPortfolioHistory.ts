export interface IStoredPortfolioHistory {
    month: number;
    cashDeposit: number;
    totalValue: number;
}

export class StoredPortfolioHistory implements IStoredPortfolioHistory {

    public month: number;
    public cashDeposit: number;
    public totalValue: number;


    constructor(month: number, cashDeposit: number, totalValue: number) {
        this.month = month;
        this.cashDeposit = cashDeposit;
        this.totalValue = totalValue;
    }


}
