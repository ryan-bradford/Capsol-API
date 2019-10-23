import { IUserDao } from './UserDao';
import { IPersistedInvestor, PersistedInvestor, IStorableInvestor } from '@entities';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import { singleton } from 'tsyringe';

@singleton()
export class SqlInvestorDao implements IUserDao<IPersistedInvestor, IStorableInvestor> {


    /**
     * @param email
     */
    public async getOne(id: string, loadRequests?: boolean): Promise<IPersistedInvestor | null> {
        return getRepository(PersistedInvestor)
            .findOne(id)
            .then((result) => result ? result : null);
    }


    /**
     * @param email
     */
    public async getOneByEmail(email: string, loadRequests?: boolean): Promise<IPersistedInvestor | null> {
        return getRepository(PersistedInvestor)
            .findOne({ email })
            .then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(loadRequests?: boolean): Promise<IPersistedInvestor[]> {
        return getRepository(PersistedInvestor).find({
            relations: ['investments'].concat(loadRequests ? ['requests'] : []),
        });
    }


    /**
     *
     * @param user
     */
    public async add(user: IStorableInvestor): Promise<IPersistedInvestor> {
        const newInvestor = new PersistedInvestor();
        newInvestor.email = user.email;
        newInvestor.investments = [];
        newInvestor.name = user.name;
        newInvestor.pwdHash = bcrypt.hashSync(user.password, bcrypt.genSaltSync());
        newInvestor.admin = false;
        return getRepository(PersistedInvestor).save(newInvestor);
    }


    /**
     *
     * @param id
     */
    public async delete(id: string): Promise<void> {
        await getRepository(PersistedInvestor).delete(id);
        return;
    }
}
