import { Entity, PrimaryColumn, Column, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IPersistedInvestment, IPersistedHomeowner, PersistedInvestment, PersistedHomeowner } from '@entities';
import { logger } from '@shared';

export interface IPersistedCompanyFee {
    id: string;
    amount: number;
}

@Entity('company_fee')
export class PersistedCompanyFee implements IPersistedCompanyFee {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    public amount!: number;

}
