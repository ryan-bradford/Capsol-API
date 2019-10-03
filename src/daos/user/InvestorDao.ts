import { IUserDao } from './UserDao';
import { IPersistedInvestor, IStoredInvestor, PersistedInvestor, IPersistedInvestment } from '@entities';
import { getRepository } from 'typeorm';
import { getRandomInt } from '@shared';
import { IInvestmentDao, SqlInvestmentDao } from '@daos';

export class SqlInvestorDao implements IUserDao<IPersistedInvestor, IStoredInvestor> {


    /**
     * @param email
     */
    public async getOne(emailOrId: string | number): Promise<IPersistedInvestor | null> {
        return getRepository(PersistedInvestor)
            .findOne(typeof emailOrId === 'string' ? { email: emailOrId } : { id: emailOrId })
            .then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(): Promise<IPersistedInvestor[]> {
        return getRepository(PersistedInvestor).find();
    }


    /**
     *
     * @param user
     */
    public async add(user: IStoredInvestor): Promise<IPersistedInvestor> {
        const investmentDao = new SqlInvestmentDao();
        const newInvestor = new PersistedInvestor();
        newInvestor.email = user.email;
        newInvestor.id = user.id ? user.id : getRandomInt();
        newInvestor.investments = (await Promise.all(user.investments
            .map((investment) => investmentDao.getInvestment(investment.id))
            .filter((investment) => {
                if (investment === null) {
                    throw new Error('Investment not found');
                }
                return investment !== null;
            }))) as IPersistedInvestment[];
        newInvestor.name = user.name;
        newInvestor.pwdHash = user.pwdHash;
        return getRepository(PersistedInvestor).save(newInvestor);
    }


    /**
     *
     * @param id
     */
    public async delete(id: number): Promise<void> {
        getRepository(PersistedInvestor).delete(id);

    }
}
