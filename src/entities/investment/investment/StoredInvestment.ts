export interface IStoredInvestment {
    id: string;
    contractId: string;
    currentValue: number;
    ownerId: string;
}

export class StoredInvestment implements IStoredInvestment {

    public id: string;
    public contractId: string;
    public currentValue: number;
    public ownerId: string;


    constructor(id: string, contractId: string, currentValue: number, ownerId: string) {
        this.id = id;
        this.contractId = contractId;
        this.currentValue = currentValue;
        this.ownerId = ownerId;
    }

}
