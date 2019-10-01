import { Column, OneToMany, PrimaryColumn, OneToOne, Entity } from 'typeorm';
import { IInvestment, IHomeowner, Investment, Homeowner } from '@entities';

export interface IContract {
    id: number;
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    investments: IInvestment[];
    homeowner: IHomeowner;
    readonly isFulfilled: boolean;
    readonly yearsPassed: number;
    readonly depreciationValue: number;
}

@Entity()
export class Contract implements IContract {

    @PrimaryColumn()
    public id!: number;

    @Column()
    public saleAmount!: number;

    @Column()
    public length!: number;

    @Column()
    public monthlyPayment!: number;

    @OneToMany((type) => Investment, (investment) => investment.contract)
    public investments!: IInvestment[];

    @OneToOne((type) => Homeowner, (homeowner) => homeowner.contract)
    public homeowner!: IHomeowner;


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
