import { Entity, PrimaryColumn, ManyToOne, Column } from 'typeorm';
import { IPersistedContract, IPersistedInvestor, PersistedContract, PersistedInvestor } from '@entities';

export interface IPersistedInvestment {
    id: number;
    contract: IPersistedContract;
    percentage: number;
    owner: IPersistedInvestor;
    readonly value: number;
}

@Entity('investment')
export class PersistedInvestment implements IPersistedInvestment {

    @PrimaryColumn()
    public id!: number;

    @ManyToOne((type) => PersistedContract, (contract) => contract.investments)
    public contract!: IPersistedContract;

    @Column()
    public percentage!: number;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.investments)
    public owner!: IPersistedInvestor;

    public get value(): number {
        return this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed;
    }
}
