import { Entity, Column, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IPersistedInvestment, IPersistedHomeowner, PersistedInvestment, PersistedHomeowner } from '@entities';
import { logger, getDateAsNumber } from '@shared';

/**
 * Represents all the information stored in the database for contracts.
 */
export interface IPersistedContract {
    /**
     * The UUID of the contract.
     *
     * @unique
     */
    id: string;
    /**
     * The amount that the contract was sold for.
     *
     * @invariant saleAmount >= 0
     */
    saleAmount: number;
    /**
     * The date the first payment was made on the contract.
     * Null if no payment has been made.
     */
    firstPaymentDate: number | null;
    /**
     * The amount the homeowner has to pay every month.
     *
     * @invariant monthlyPayment > 0
     */
    monthlyPayment: number;
    /**
     * The investments that are associated with the contract.
     *
     * @invariant investments.sum(investments.amount) <= saleAmount
     */
    investments: IPersistedInvestment[];
    /**
     * The homeowner that owns this contract.
     */
    homeowner: IPersistedHomeowner;
    /**
     * The length of this contract in months.
     *
     * @invariant totalLength > 0
     */
    totalLength: number;
    // TODO: convert readonly variables to methods.
    /**
     * Whether or not this contract is fully fulfilled with investments.
     */
    readonly isFulfilled: boolean;
    /**
     * The number of months passed since the contract first payment.
     *
     * @invariant monthsPassed >= 0
     */
    readonly monthsPassed: number;
    /**
     * The amount this contract decreases in value every month.
     *
     * @invariant depreciationValue > 0
     */
    readonly depreciationValue: number;
    /**
     * The amount of this contract that remains unsold to investors.
     *
     * @invariant unsoldAmount >= 0
     */
    readonly unsoldAmount: number;
}

@Entity('contract')
export class PersistedContract implements IPersistedContract {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public saleAmount!: number;

    @Column()
    public totalLength!: number;

    @Column({ nullable: true })
    public firstPaymentDate!: number;

    @Column()
    public monthlyPayment!: number;

    @OneToMany((type) => PersistedInvestment, (investment) => investment.contract, { onDelete: 'CASCADE' })
    public investments!: IPersistedInvestment[];

    @OneToOne((type) => PersistedHomeowner, (homeowner) => homeowner.contract, { onDelete: 'CASCADE' })
    @JoinColumn()
    public homeowner!: IPersistedHomeowner;


    get isFulfilled(): boolean {
        return this.unsoldAmount === 0;
    }


    get monthsPassed(): number {
        return this.firstPaymentDate ? getDateAsNumber() - this.firstPaymentDate : 0;
    }


    get depreciationValue(): number {
        return this.saleAmount / this.totalLength;
    }

    get unsoldAmount(): number {
        let toReturn = this.saleAmount;
        this.investments.forEach((investment) => toReturn -=
            Number(investment.sellDate === null ? investment.amount : 0));
        return toReturn;
    }
}
