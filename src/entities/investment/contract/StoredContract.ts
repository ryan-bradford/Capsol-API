/**
 * Stores all the information that should be made public about a contract.
 */
export interface IStoredContract {
    /**
     * The UUID of the contract.
     *
     * @unique
     */
    id: string;
    /**
     * The amount that the contract was sold for.
     *
     * @invariant saleAmount >= 0
     */
    saleAmount: number;
    /**
     * The length of this contract in months.
     *
     * @invariant totalLength > 0
     */
    length: number;
    /**
     * The amount the homeowner has to pay every month.
     *
     * @invariant monthlyPayment > 0
     */
    monthlyPayment: number;
    /**
     * The date the first payment was made on the contract.
     * Null if no payment has been made.
     */
    firstPaymentDate: number | null;
    /**
     * The percent of the sale amount that has been fulfilled by investors.
     */
    percentFulfilled: number;
    /**
     * The position this contract is in queue for receiving investor money.
     */
    positionInQueue: number | null;
    /**
     * The ID of the homeowner who owns this contract.
     */
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
