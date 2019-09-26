import { IContract, Contract } from './Contract';
import { ManyToOne, Column, BaseEntity } from 'typeorm';
import { Investor, IInvestor } from '../user/Investor';

export interface IInvestment {
    contract: IContract;
    percentage: number;
    owner: IInvestor;
    forSale: boolean;
    readonly value: number;
}

export class Investment extends BaseEntity implements IInvestment {

    @ManyToOne((type) => Contract, (contract) => contract.investments)
    public contract: IContract;

    @Column()
    public percentage: number;

    @ManyToOne((type) => Investor, (investor) => investor.investments)
    public owner: IInvestor;

    @Column()
    public forSale: boolean;


    constructor(percentage: number, contract: IContract, owner: IInvestor, forSale: boolean) {
        super();
        this.percentage = percentage;
        this.contract = contract;
        this.owner = owner;
        this.forSale = forSale;
    }

    public get value(): number {
        return this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed;
    }
}
