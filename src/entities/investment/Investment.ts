import { ManyToOne, Column, PrimaryColumn, Entity } from 'typeorm';
import { Investor, IInvestor, Contract, IContract } from '@entities';

export interface IInvestment {
    id: number;
    contract: IContract;
    percentage: number;
    owner: IInvestor;
    forSale: boolean;
    readonly value: number;
}

@Entity()
export class Investment implements IInvestment {

    @PrimaryColumn()
    public id!: number;

    @ManyToOne((type) => Contract, (contract) => contract.investments)
    public contract!: IContract;

    @Column()
    public percentage!: number;

    @ManyToOne((type) => Investor, (investor) => investor.investments)
    public owner!: IInvestor;

    @Column()
    public forSale!: boolean;

    public get value(): number {
        return this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed;
    }
}
