import { IInvestment, Investment } from '@entities';

export interface IInvestmentService {
    addFunds(userId: number, amount: number): Promise<IInvestment[]>;
    sellInvestments(userId: number, amount: number): Promise<void>;
    getInvestments(userId?: number): Promise<IInvestment[]>;
}

export class InvestmentService implements IInvestmentService {


    public async getInvestments(userId?: number): Promise<IInvestment[]> {
        return Investment.find().then((investments) =>
            investments.filter((investment) => !userId || investment.owner.id === userId));
    }


    public async addFunds(userId: number, amount: number): Promise<IInvestment[]> {
        throw new Error('Method not implemented.');
    }


    public async sellInvestments(userId: number, amount: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
