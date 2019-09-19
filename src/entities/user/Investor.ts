import { IUser } from './User';
import { IInvestment } from '../investment/Investment';

export interface IInvestor extends IUser {
    investments: IInvestment[];
    addInvestment(investment: IInvestment): void;
}
