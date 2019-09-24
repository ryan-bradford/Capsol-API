import { IUser, IContract, Contract } from '@entities';
import { getRandomInt } from '@shared';
import { MockDaoMock } from '../MockDb/MockDao.mock';
import { IContractDao } from './ContractDao';


export class ContractDao extends MockDaoMock implements IContractDao {


    public async getContract(id: number): Promise<IContract> {
        return this.getContracts().then((contracts) => {
            return contracts.filter((contract) => contract.id && contract.id === id)[0];
        });
    }


    public async getContracts(userId?: number): Promise<IContract[]> {
        try {
            const db = await super.openDb();
            return db.contracts
                .filter((contract: any) => !userId || contract.userId === userId)
                .map((contract: any) =>
                    new Contract(contract.saleAmount, contract.length, contract.monthlyPayment,
                        contract.userId, contract.id));
        } catch (err) {
            throw err;
        }
    }


    public async createContract(amount: number, interestRate: number, years: number, userId: number):
        Promise<IContract> {
        try {
            const db = await super.openDb();
            const toAdd = new Contract(amount, length, interestRate * amount,
                userId);
            db.contracts.push(toAdd);
            await super.saveDb(db);
            return toAdd;
        } catch (err) {
            throw err;
        }
    }

}
