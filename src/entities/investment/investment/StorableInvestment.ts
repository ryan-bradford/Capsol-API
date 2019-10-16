export interface IStorableInvestment {
    contractId: string;
    amount: number;
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
