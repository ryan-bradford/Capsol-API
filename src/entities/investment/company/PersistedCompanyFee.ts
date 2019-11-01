import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
/**
 * Represents all the information stored in the database for company fees.
 */
export interface IPersistedCompanyFee {
    /**
     * The UUID of the company fee.
     *
     * @unique
     */
    id: string;
    /**
     * The amount that was taken as a fee.
     *
     * @invariant amount >= 0
     */
    amount: number;
}

@Entity('company_fee')
export class PersistedCompanyFee implements IPersistedCompanyFee {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    public amount!: number;

}
