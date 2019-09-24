import { IContract } from './Contract';

export interface IInvestment {
    contract: IContract;
    percentage: number;
    ownerId: number;
    forSale: boolean;
    readonly value: number;
}

export class Investment implements IInvestment {
    public contract: IContract;
    public percentage: number;
    public ownerId: number;
    public forSale: boolean;


    constructor(percentage: number, contract: IContract, ownerId: number, forSale: boolean) {
        this.percentage = percentage;
        this.contract = contract;
        this.ownerId = ownerId;
        this.forSale = forSale;
    }

    public get value(): number {
        return this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed;
    }
}
