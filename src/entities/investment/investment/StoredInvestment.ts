export interface IStoredInvestment {
    id: number;
    contractId: number;
    percentage: number;
    ownerId: number;
}

export class StoredInvestment implements IStoredInvestment {

    public id: number;
    public contractId: number;
    public percentage: number;
    public ownerId: number;


    constructor(id: number, contractId: number, percentage: number, ownerId: number) {
        this.id = id;
        this.contractId = contractId;
        this.percentage = percentage;
        this.ownerId = ownerId;
    }

}
