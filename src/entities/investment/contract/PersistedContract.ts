import { Entity, PrimaryColumn, Column, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IPersistedInvestment, IPersistedHomeowner, PersistedInvestment, PersistedHomeowner } from '@entities';
import { logger } from '@shared';

export interface IPersistedContract {
    id: string;
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    investments: IPersistedInvestment[];
    homeowner: IPersistedHomeowner;
    startLength: number;
    readonly isFulfilled: boolean;
    readonly yearsPassed: number;
    readonly depreciationValue: number;
    readonly unsoldAmount: number;
}

@Entity('contract')
export class PersistedContract implements IPersistedContract {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public saleAmount!: number;

    @Column()
    public startLength!: number;

    @Column()
    public length!: number;

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


    get yearsPassed(): number {
        return this.startLength - this.length;
    }


    get depreciationValue(): number {
        return this.saleAmount / this.startLength;
    }

    get unsoldAmount(): number {
        let toReturn = this.saleAmount;
        this.investments.forEach((investment) => toReturn -= Number(investment.amount));
        return toReturn;
    }
}
