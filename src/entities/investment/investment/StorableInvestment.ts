export interface IStorableInvestment {
    contractId: number;
    percentage: number;
    ownerId: number;
}

export class StorableInvestment implements IStorableInvestment {

    public contractId: number;
    public percentage: number;
    public ownerId: number;


    constructor(contractId: number, percentage: number, ownerId: number) {
        this.contractId = contractId;
        this.percentage = percentage;
        this.ownerId = ownerId;
    }

}
