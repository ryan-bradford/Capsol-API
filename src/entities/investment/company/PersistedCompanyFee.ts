import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
/**
 * Represents all the information stored in the database for company fees.
 */
export interface IPersistedCompanyFee {
    /**
     * The amount that was taken as a fee.
     *
     * @invariant amount >= 0
     */
    amount: number;
    /**
     * The UUID of the company fee.
     *
     * @unique
     */
    id: string;
}

@Entity('company_fee')
export class PersistedCompanyFee implements IPersistedCompanyFee {

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    public amount!: number;

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

}
