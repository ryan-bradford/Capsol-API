import { IInvestment, Investment } from '@entities';

export interface IInvestmentDao {
    getInvestments(userId?: number): Promise<IInvestment[]>;
}

export class SqlInvestmentDao implements IInvestmentDao {


    public async getInvestments(userId?: number): Promise<IInvestment[]> {
        return Investment.find().then((investments) =>
            investments.filter((investment) => !userId || investment.owner.id === userId));
    }


}
