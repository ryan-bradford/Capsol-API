import { IContract, Contract } from './Contract';
import { ManyToOne, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { Investor, IInvestor } from '../user/Investor';
import { getRandomInt } from '@shared';

export interface IInvestment {
    id: number;
    contract: IContract;
    percentage: number;
    owner: IInvestor;
    forSale: boolean;
    readonly value: number;
}

export class Investment extends BaseEntity implements IInvestment {

    @PrimaryColumn()
    public id: number;

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
        this.id = getRandomInt();
        this.percentage = percentage;
        this.contract = contract;
        this.owner = owner;
        this.forSale = forSale;
    }

    public get value(): number {
        return this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed;
    }
}
