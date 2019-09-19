import { IInvestment, Investment } from './Investment';
import { IInvestor } from '../user/Investor';

export interface IContract {
    saleAmount: number;
    length: number;
    monthlyPayment: number;
    investments: IInvestment[];
    readonly isFulfilled: boolean;
    readonly yearsPassed: number;
    readonly depreciationValue: number;
    buyContract(percentage: number, investor: IInvestor): IInvestment;
}

export class Contract implements IContract {
    public saleAmount: number;
    public length: number;
    public monthlyPayment: number;
    public investments: IInvestment[];


    constructor(saleAmount: number, length: number, monthlyPayment: number) {
        this.saleAmount = saleAmount;
        this.length = length;
        this.monthlyPayment = monthlyPayment;
        this.investments = [];
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


    public buyContract(percentage: number, investor: IInvestor): IInvestment {
        const toReturn = new Investment(percentage, this);
        this.investments.push(toReturn);
        investor.addInvestment(toReturn);
        return toReturn;
    }
}
