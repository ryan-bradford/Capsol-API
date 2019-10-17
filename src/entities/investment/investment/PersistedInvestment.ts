import { Entity, PrimaryColumn, ManyToOne, Column, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IPersistedContract, IPersistedInvestor, PersistedContract, PersistedInvestor } from '@entities';

export interface IPersistedInvestment {
    id: string;
    contract: IPersistedContract;
    amount: number;
    owner: IPersistedInvestor;
    readonly value: number;
}

@Entity('investment')
export class PersistedInvestment implements IPersistedInvestment {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @ManyToOne((type) => PersistedContract, (contract) => contract.investments, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    public contract!: IPersistedContract;

    @Column()
    public amount!: number;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.investments, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    public owner!: IPersistedInvestor;

    public get value(): number {
        return this.amount / this.contract.saleAmount *
            (this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed);
    }
}
