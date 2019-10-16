import { IStoredInvestment } from '@entities';

export interface IStoredContract {
    id: string;
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    investments: IStoredInvestment[];
    homeownerId: string;
}

export class StoredContract implements IStoredContract {

    public id: string;
    public saleAmount: number;
    public length: number;
    public monthlyPayment: number;
    public homeownerId: string;
    public investments: IStoredInvestment[];


    constructor(id: string, saleAmount: number, length: number, monthlyPayment: number,
        // tslint:disable-next-line: align
        homeownerId: string, investments: IStoredInvestment[]) {
        this.id = id;
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.homeownerId = homeownerId;
        this.investments = investments;
    }
}
