import { Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { PersistedInvestor, IPersistedInvestor } from '@entities';

export interface IPersistedCashDeposit {
    id: string;
    amount: number;
    date: number;
    user: IPersistedInvestor;
}

@Entity('cash_deposit')
export class PersistedCashDeposit implements IPersistedCashDeposit {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public amount!: number;

    @Column()
    public date!: number;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.cashDeposits, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    public user!: IPersistedInvestor;

}
