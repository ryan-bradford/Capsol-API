/**
 * Stores all the information that should be made public about an investment.
 */
export interface IStoredInvestment {
    /**
     * The date of the first payment on the contract.
     * Null if it has not paid yet.
     */
    firstPaymentDate: number | null;
    /**
     * The UUID of the investment.
     *
     * @unique
     */
    id: string;
    /**
     * The amount this investment pays out per month.
     */
    monthlyEarnings: number;
    /**
     * The ID of the investor who owns this contract.
     */
    ownerId: string;
    /**
     * The real dollar amount that was invested.
     */
    saleAmount: number;
    /**
     * The length of the contract associated with this investment.
     */
    totalContractLength: number;
}

export class StoredInvestment implements IStoredInvestment {
    public firstPaymentDate: number | null;

    public id: string;
    public monthlyEarnings: number;
    public ownerId: string;
    public saleAmount: number;
    public totalContractLength: number;


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
