export interface IStorableContract {
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    homeownerId: string;
}

export class StorableContract implements IStorableContract {

    public saleAmount: number;
    public length: number;
    public monthlyPayment: number;
    public homeownerId: string;


    constructor(saleAmount: number, length: number, monthlyPayment: number, homeownerId: string) {
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.homeownerId = homeownerId;
    }

}
