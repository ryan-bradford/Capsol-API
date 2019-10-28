import { Entity, Column, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IPersistedInvestment, IPersistedHomeowner, PersistedInvestment, PersistedHomeowner } from '@entities';
import { logger, getDateAsNumber } from '@shared';

export interface IPersistedContract {
    id: string;
    saleAmount: number;
    firstPaymentDate: number | null;
    monthlyPayment: number;
    investments: IPersistedInvestment[];
    homeowner: IPersistedHomeowner;
    totalLength: number;
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


    get yearsPassed(): number {
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
