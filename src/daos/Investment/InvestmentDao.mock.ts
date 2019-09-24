import { IInvestment, Investment } from '@entities';
import { MockDaoMock } from '../MockDb/MockDao.mock';
import { IInvestmentDao } from './InvestmentDao';
import { ContractDaoFactory } from '@daos';

const contractDao = ContractDaoFactory();

export class InvestmentDao extends MockDaoMock implements IInvestmentDao {


    public async getInvestments(userId?: number): Promise<IInvestment[]> {
        try {
            const db = await super.openDb();
            return Promise.all(db.investments
                .filter((investment: any) => !userId || (investment.ownerId === userId))
                .map(async (investment: any) => {
                    const contract = await contractDao.getContract(investment.contractId);
                    return new Investment(investment.percentage, contract, investment.ownerId, investment.forSale);
                }));
        } catch (err) {
            throw err;
        }
    }


    public async addFunds(userId: number, amount: number): Promise<IInvestment[]> {
        throw new Error('Method not implemented.');
    }


    public async sellInvestments(userId: number, amount: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
