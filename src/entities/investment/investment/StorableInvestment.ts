export interface IStorableInvestment {
    contractId: number;
    amount: number;
    ownerId: number;
}

export class StorableInvestment implements IStorableInvestment {

    public contractId: number;
    public amount: number;
    public ownerId: number;


    constructor(contractId: number, amount: number, ownerId: number) {
        this.contractId = contractId;
        this.amount = amount;
        this.ownerId = ownerId;
    }

}
