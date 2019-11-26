import { Entity, ManyToOne, Column, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IPersistedContract, IPersistedInvestor, PersistedContract, PersistedInvestor } from '@entities';

/**
 * Represents all the information stored in the database for investments.
 */
export interface IPersistedInvestment {
    /**
     * The real dollar amount that was invested.
     */
    amount: number;
    /**
     * The contract associated with this investment.
     */
    contract: IPersistedContract;
    /**
     * The UUID of the investment.
     *
     * @unique
     */
    id: string;
    /**
     * The investor who owns this contract.
     */
    owner: IPersistedInvestor;
    /**
     * The month as a number this contract was purchased on.
     */
    purchaseDate: number;
    /**
     * The month as a number this contract was sold on.
     * Null if it was not sold.
     */
    sellDate: number | null;
    /**
     * The value of this investment if it was sold to another investor.
     */
    value(currentMonth: number): number;
}

@Entity('investment')
export class PersistedInvestment implements IPersistedInvestment {

    @Column()
    public amount!: number;

    @ManyToOne((type) => PersistedContract, (contract) => contract.investments, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    public contract!: IPersistedContract;

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.investments, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    public owner!: IPersistedInvestor;

    @Column()
    public purchaseDate!: number;

    @Column({ nullable: true })
    public sellDate!: number;


    public value(currentMonth: number): number {
        return this.amount / this.contract.saleAmount *
            (this.contract.saleAmount - this.contract.depreciationValue() * this.contract.monthsPassed(currentMonth));
    }
}
