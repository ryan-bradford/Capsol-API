export interface IStoredInvestment {
    id: string;
    saleAmount: number;
    totalContractLength: number;
    firstPaymentDate: number | null;
    monthlyEarnings: number;
    ownerId: string;
}

export class StoredInvestment implements IStoredInvestment {

    public id: string;
    public saleAmount: number;
    public totalContractLength: number;
    public firstPaymentDate: number | null;
    public monthlyEarnings: number;
    public ownerId: string;


    constructor(
        id: string, saleAmount: number, totalContractLength: number,
        firstPaymentDate: number | null, ownerId: string, monthlyEarnings: number) {
        this.id = id;
        this.saleAmount = saleAmount;
        this.totalContractLength = totalContractLength;
        this.firstPaymentDate = firstPaymentDate;
        this.monthlyEarnings = monthlyEarnings;
        this.ownerId = ownerId;
    }

}
