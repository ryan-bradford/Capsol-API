export interface IStorableContract {
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    homeownerId: number;
}

export class StorableContract implements IStorableContract {

    public saleAmount: number;
    public length: number;
    public monthlyPayment: number;
    public homeownerId: number;


    constructor(saleAmount: number, length: number, monthlyPayment: number, homeownerId: number) {
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.homeownerId = homeownerId;
    }

}
