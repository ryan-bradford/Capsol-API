/**
 * Stores all the information needed to create an investment.
 */
export interface IStorableInvestment {
    /**
     * The ID of the contract associated with this investment.
     */
    contractId: string;
    /**
     * The real dollar amount that will be invested.
     */
    amount: number;
    /**
     * The ID of the investor who owns this contract.
     */
    ownerId: string;
}

export class StorableInvestment implements IStorableInvestment {

    public contractId: string;
    public amount: number;
    public ownerId: string;


    constructor(contractId: string, amount: number, ownerId: string) {
        this.contractId = contractId;
        this.amount = amount;
        this.ownerId = ownerId;
    }

}
