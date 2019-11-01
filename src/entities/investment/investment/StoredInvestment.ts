/**
 * Stores all the information that should be made public about an investment.
 */
export interface IStoredInvestment {
    /**
     * The UUID of the investment.
     *
     * @unique
     */
    id: string;
    /**
     * The real dollar amount that was invested.
     */
    saleAmount: number;
    /**
     * The length of the contract associated with this investment.
     */
    totalContractLength: number;
    /**
     * The date of the first payment on the contract.
     * Null if it has not paid yet.
     */
    firstPaymentDate: number | null;
    /**
     * The amount this investment pays out per month.
     */
    monthlyEarnings: number;
    /**
     * The ID of the investor who owns this contract.
     */
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
