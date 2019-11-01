import { Min, IsUUID } from 'class-validator';

/**
 * Stores all the information needed to create a contract.
 */
export interface IStorableContract {
    /**
     * The amount this contract was sold for.
     *
     * @invariant saleAmount > 0
     */
    saleAmount: number;
    /**
     * The length this contract will be for in months.
     *
     * @invariant length > 0
     */
    length: number;
    /**
     * The monthly payment the homeowner will make.
     *
     * @invariant monthlyPayment > 0
     */
    monthlyPayment: number;
    /**
     * The ID of the homeowner who will own this contract.
     */
    homeownerId: string;
}

export class StorableContract implements IStorableContract {

    @Min(0)
    public saleAmount: number;

    @Min(0)
    public length: number;

    @Min(0)
    public monthlyPayment: number;

    @IsUUID()
    public homeownerId: string;


    constructor(saleAmount: number, length: number, monthlyPayment: number, homeownerId: string) {
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.homeownerId = homeownerId;
    }

}
