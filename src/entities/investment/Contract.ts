import { IInvestment, Investment } from './Investment';
import { getRandomInt } from '@shared';
import { Column, OneToMany, PrimaryColumn, OneToOne, BaseEntity } from 'typeorm';
import { Homeowner, IHomeowner } from '../user/Homeowner';

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

export class Contract extends BaseEntity implements IContract {

    @PrimaryColumn()
    public id: number;

    @Column()
    public saleAmount: number;

    @Column()
    public length: number;

    @Column()
    public monthlyPayment: number;

    @OneToMany((type) => Investment, (investment) => investment.contract)
    public investments: Investment[];

    @OneToOne((type) => Homeowner, (homeowner) => homeowner.contract)
    public homeowner: Homeowner;


    constructor(saleAmount: number, length: number, monthlyPayment: number, homeowner: Homeowner) {
        super();
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.investments = [];
        this.id = getRandomInt();
        this.homeowner = homeowner;
    }


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
