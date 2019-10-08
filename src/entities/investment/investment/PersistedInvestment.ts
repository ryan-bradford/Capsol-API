import { Entity, PrimaryColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
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

    @ManyToOne((type) => PersistedContract, (contract) => contract.investments, { onDelete: 'CASCADE' })
    @JoinColumn()
    public contract!: IPersistedContract;

    @Column('decimal', { precision: 5, scale: 2 })
    public percentage!: number;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.investments, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    public owner!: IPersistedInvestor;

    public get value(): number {
        return this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed;
    }
}
