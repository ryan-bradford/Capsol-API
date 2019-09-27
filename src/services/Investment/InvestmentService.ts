import { IInvestment, Investment } from '@entities';

export interface IInvestmentService {
    addFunds(userId: number, amount: number): Promise<IInvestment[]>;
    sellInvestments(userId: number, amount: number): Promise<void>;
}

export class InvestmentService implements IInvestmentService {


    public async addFunds(userId: number, amount: number): Promise<IInvestment[]> {
        throw new Error('Method not implemented.');
    }


    public async sellInvestments(userId: number, amount: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
