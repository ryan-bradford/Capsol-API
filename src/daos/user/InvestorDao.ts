import { IUserDao } from './UserDao';
import { IPersistedInvestor, IStoredInvestor, PersistedInvestor, IPersistedInvestment, IStorableInvestor } from '@entities';
import { getRepository } from 'typeorm';
import { getRandomInt } from '@shared';
import { IInvestmentDao, SqlInvestmentDao } from '@daos';

export class SqlInvestorDao implements IUserDao<IPersistedInvestor, IStorableInvestor> {


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
    public async add(user: IStorableInvestor): Promise<IPersistedInvestor> {
        const newInvestor = new PersistedInvestor();
        newInvestor.email = user.email;
        newInvestor.id = getRandomInt();
        newInvestor.investments = [];
        newInvestor.name = user.name;
        newInvestor.pwdHash = user.pwdHash;
        newInvestor.admin = false;
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
