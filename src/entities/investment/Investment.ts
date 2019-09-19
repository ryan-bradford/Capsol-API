import { IContract } from './Contract';

export interface IInvestment {
    contract: IContract;
    percentage: number;
    readonly value: number;
}

export class Investment implements IInvestment {
    public contract: IContract;
    public percentage: number;


    constructor(percentage: number, contract: IContract) {
        this.percentage = percentage;
        this.contract = contract;
    }

    public get value(): number {
        return this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed;
    }
}
