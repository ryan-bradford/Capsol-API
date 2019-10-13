import { Entity, PrimaryColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { IPersistedInvestment, IPersistedHomeowner, PersistedInvestment, PersistedHomeowner } from '@entities';
import { logger } from '@shared';

export interface IPersistedContract {
    id: number;
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    investments: IPersistedInvestment[];
    homeowner: IPersistedHomeowner;
    readonly isFulfilled: boolean;
    readonly yearsPassed: number;
    readonly depreciationValue: number;
    readonly unsoldAmount: number;
}

@Entity('contract')
export class PersistedContract implements IPersistedContract {

    @PrimaryColumn()
    public id!: number;

    @Column()
    public saleAmount!: number;

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
        let total = 0;
        this.investments.forEach((investment) => {
            total += Number(investment.percentage);
        });
        if (total > 1) {
            throw new Error(`WTF ${total}`);
        }
        return total >= 1;
    }


    get yearsPassed(): number {
        return 5;
    }


    get depreciationValue(): number {
        return this.saleAmount / this.length;
    }

    get unsoldAmount(): number {
        let toReturn = 1;
        this.investments.forEach((investment) => toReturn -= Number(investment.percentage));
        return this.saleAmount * toReturn;
    }
}
