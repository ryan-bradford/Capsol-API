export interface IStoredCashDeposit {
    id: string;
    amount: number;
    date: number;
    userId: string;
}

export class StoredCashDeposit implements IStoredCashDeposit {

    public id: string;
    public amount: number;
    public date: number;
    public userId: string;


    constructor(id: string, amount: number, date: number, userId: string) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.userId = userId;
    }


}
