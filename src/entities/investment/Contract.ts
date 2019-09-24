import { IInvestment, Investment } from './Investment';
import { IInvestor } from '../user/Investor';
import { getRandomInt } from '@shared';

export interface IContract {
    id: number;
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    investments: IInvestment[];
    userId: number;
    readonly isFulfilled: boolean;
    readonly yearsPassed: number;
    readonly depreciationValue: number;
}

export class Contract implements IContract {
    public saleAmount: number;
    public length: number;
    public monthlyPayment: number;
    public investments: IInvestment[];
    public id: number;
    public userId: number;


    constructor(saleAmount: number, length: number, monthlyPayment: number, userId: number, id?: number) {
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.investments = [];
        this.id = id ? id : getRandomInt();
        this.userId = userId;
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
