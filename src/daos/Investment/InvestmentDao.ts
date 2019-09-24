import { IInvestment } from '@entities';

export interface IInvestmentDao {
    addFunds(userId: number, amount: number): Promise<IInvestment[]>;
    sellInvestments(userId: number, amount: number): Promise<void>;
    getInvestments(userId?: number): Promise<IInvestment[]>;
}

export class InvestmentDao implements IInvestmentDao {


    public async getInvestments(): Promise<IInvestment[]> {
        throw new Error('Method not implemented.');
    }


    public async addFunds(userId: number, amount: number): Promise<IInvestment[]> {
        throw new Error('Method not implemented.');
    }


    public async sellInvestments(userId: number, amount: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
