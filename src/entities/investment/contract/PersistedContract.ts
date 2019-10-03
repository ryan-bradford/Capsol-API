import { Entity, PrimaryColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { IPersistedInvestment, IPersistedHomeowner, PersistedInvestment, PersistedHomeowner } from '@entities';

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

    @OneToMany((type) => PersistedInvestment, (investment) => investment.contract)
    public investments!: IPersistedInvestment[];

    @OneToOne((type) => PersistedHomeowner, (homeowner) => homeowner.contract)
    public homeowner!: IPersistedHomeowner;


    get isFulfilled(): boolean {
        let total = 0;
        this.investments.forEach((investment) => {
            total += investment.percentage;
        });
        if (total > 1) {
            throw new Error('WTF');
        }
        return total === 1;
    }


    get yearsPassed(): number {
        return 5;
    }


    get depreciationValue(): number {
        return this.saleAmount / this.length;
    }
}
