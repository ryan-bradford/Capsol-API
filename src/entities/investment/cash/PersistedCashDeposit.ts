import { Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { PersistedInvestor, IPersistedInvestor } from '@entities';

/**
 * Represents all the information stored in the database for cash deposits.
 */
export interface IPersistedCashDeposit {
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
     * The UUID of the cash deposit.
     *
     * @unique
     */
    id: string;
    /**
     * The user who made this deposit.
     */
    user: IPersistedInvestor;
}

@Entity('cash_deposit')
export class PersistedCashDeposit implements IPersistedCashDeposit {

    @Column()
    public amount!: number;

    @Column()
    public date!: number;

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.cashDeposits, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    public user!: IPersistedInvestor;

}
