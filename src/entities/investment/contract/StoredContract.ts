import { IStoredInvestment } from '@entities';

export interface IStoredContract {
    id: number;
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    investments: IStoredInvestment[];
    homeownerId: number;
}

export class StoredContract implements IStoredContract {

    public id: number;
    public saleAmount: number;
    public length: number;
    public monthlyPayment: number;
    public homeownerId: number;
    public investments: IStoredInvestment[];


    constructor(id: number, saleAmount: number, length: number, monthlyPayment: number,
        // tslint:disable-next-line: align
        homeownerId: number, investments: IStoredInvestment[]) {
        this.id = id;
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.homeownerId = homeownerId;
        this.investments = investments;
    }
}
