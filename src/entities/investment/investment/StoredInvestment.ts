export interface IStoredInvestment {
    id: string;
    saleAmount: number;
    totalContractLength: number;
    firstPaymentDate: number;
    monthlyEarnings: number;
    ownerId: string;
}

export class StoredInvestment implements IStoredInvestment {

    public id: string;
    public saleAmount: number;
    public totalContractLength: number;
    public firstPaymentDate: number;
    public monthlyEarnings: number;
    public ownerId: string;


    constructor(
        id: string, saleAmount: number, totalContractLength: number,
        firstPaymentDate: number, ownerId: string, monthlyEarnings: number) {
        this.id = id;
        this.saleAmount = saleAmount;
        this.totalContractLength = totalContractLength;
        this.firstPaymentDate = firstPaymentDate;
        this.monthlyEarnings = monthlyEarnings;
        this.ownerId = ownerId;
    }

}
