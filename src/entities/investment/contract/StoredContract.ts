import { IStoredInvestment } from '@entities';

export interface IStoredContract {
    id: string;
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    firstPaymentDate: number | null;
    percentFulfilled: number;
    positionInQueue: number | null;
    homeownerId: string;
}

export class StoredContract implements IStoredContract {

    public id: string;
    public saleAmount: number;
    public length: number;
    public monthlyPayment: number;
    public homeownerId: string;
    public firstPaymentDate: number | null;
    public percentFulfilled: number;
    public positionInQueue: number | null;


    constructor(
        id: string, saleAmount: number, length: number, monthlyPayment: number,
        firstPaymentDate: number | null, percentFulfilled: number, positionInQueue: number | null,
        homeownerId: string) {
        this.id = id;
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.homeownerId = homeownerId;
        this.firstPaymentDate = firstPaymentDate;
        this.percentFulfilled = percentFulfilled;
        this.positionInQueue = positionInQueue;
    }
}
