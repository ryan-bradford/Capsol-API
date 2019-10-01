import { IInvestment, Investment } from '@entities';
import { getRepository } from 'typeorm';
import { getRandomInt } from '@shared';

export interface IInvestmentDao {
    getInvestments(userId?: number): Promise<IInvestment[]>;
    createInvestment(investment: IInvestment): Promise<void>;
}

export class SqlInvestmentDao implements IInvestmentDao {


    public async createInvestment(investment: IInvestment): Promise<void> {
        const toSave = new Investment();
        toSave.contract = investment.contract;
        toSave.percentage = investment.percentage;
        toSave.forSale = investment.forSale;
        toSave.id = investment.id ? investment.id : getRandomInt();
        toSave.owner = investment.owner;
        await getRepository(Investment).save(toSave);
    }


    public async getInvestments(userId?: number): Promise<IInvestment[]> {
        return getRepository(Investment).find().then((investments) =>
            investments.filter((investment) => !userId || investment.owner.id === userId));
    }


}
