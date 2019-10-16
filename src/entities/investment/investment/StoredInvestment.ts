export interface IStoredInvestment {
    id: string;
    contractId: number;
    percentage: number;
    ownerId: string;
}

export class StoredInvestment implements IStoredInvestment {

    public id: string;
    public contractId: number;
    public percentage: number;
    public ownerId: string;


    constructor(id: string, contractId: number, percentage: number, ownerId: string) {
        this.id = id;
        this.contractId = contractId;
        this.percentage = percentage;
        this.ownerId = ownerId;
    }

}
