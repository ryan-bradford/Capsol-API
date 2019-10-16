import { Entity, PrimaryColumn, ManyToOne, Column, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IPersistedContract, IPersistedInvestor, PersistedContract, PersistedInvestor } from '@entities';

export interface IPersistedInvestment {
    id: string;
    contract: IPersistedContract;
    percentage: number;
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

    get percentage() {
        return this.amount / this.contract.saleAmount;
    }

    set percentage(newPercentage: number) {
        this.amount = this.contract.saleAmount * newPercentage;
    }

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.investments, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    public owner!: IPersistedInvestor;

    public get value(): number {
        return this.percentage *
            (this.contract.saleAmount - this.contract.depreciationValue * this.contract.yearsPassed);
    }
}
