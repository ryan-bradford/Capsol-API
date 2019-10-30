import { Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { PersistedInvestor, IPersistedInvestor } from '@entities';

/**
 * Represents all the information stored in the database for cash deposits.
 */
export interface IPersistedCashDeposit {
    /**
     * The UUID of the cash deposit.
     *
     * @unique
     */
    id: string;
    /**
     * The amount that was deposited.
     *
     * @invariant amount >= 0
     */
    amount: number;
    /**
     * The month this amount was deposited on as a number.
     */
    date: number;
    /**
     * The user who made this deposit.
     */
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
