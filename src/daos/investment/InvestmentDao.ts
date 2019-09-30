import { IInvestment, Investment } from '@entities';
import { getRepository } from 'typeorm';

export interface IInvestmentDao {
    getInvestments(userId?: number): Promise<IInvestment[]>;
    createInvestment(investment: IInvestment): Promise<void>;
}

export class SqlInvestmentDao implements IInvestmentDao {


    public async createInvestment(investment: IInvestment): Promise<void> {
        await (getRepository(Investment)).save(
            new Investment(investment.percentage, investment.contract, investment.owner, investment.forSale));
    }


    public async getInvestments(userId?: number): Promise<IInvestment[]> {
        return (getRepository(Investment)).find().then((investments) =>
            investments.filter((investment) => !userId || investment.owner.id === userId));
    }


}
