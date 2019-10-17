export interface IStoredInvestment {
    id: string;
    contractId: number;
    amount: number;
    ownerId: string;
}

export class StoredInvestment implements IStoredInvestment {

    public id: string;
    public contractId: number;
    public amount: number;
    public ownerId: string;


    constructor(id: string, contractId: number, amount: number, ownerId: string) {
        this.id = id;
        this.contractId = contractId;
        this.amount = amount;
        this.ownerId = ownerId;
    }

}
