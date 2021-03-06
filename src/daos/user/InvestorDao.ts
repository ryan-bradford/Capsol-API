import { IUserDao } from './UserDao';
import { IPersistedInvestor, PersistedInvestor, IStorableInvestor } from '@entities';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { singleton } from 'tsyringe';
import { strict as assert } from 'assert';

/**
 * `SqlInvestorDao` is a specific implementation of `IUserDao` for `IPersistedInvestor`s
 *  for interfacing with MySQL using TypeORM.
 */
@singleton()
export class SqlInvestorDao implements IUserDao<IPersistedInvestor, IStorableInvestor> {


    /**
     * @inheritdoc
     */
    public async add(user: IStorableInvestor): Promise<IPersistedInvestor> {
        const newInvestor = new PersistedInvestor();
        newInvestor.email = user.email;
        newInvestor.investments = [];
        newInvestor.name = user.name;
        newInvestor.pwdHash = bcrypt.hashSync(user.password, bcrypt.genSaltSync());
        newInvestor.admin = false;
        await getRepository(PersistedInvestor).insert(newInvestor);
        return newInvestor;
    }


    /**
     * @inheritdoc
     */
    public async delete(id: string): Promise<void> {
        const result = await getRepository(PersistedInvestor).delete(id);
        assert(result.affected === 1, `Did not delete investor row with ID ${id}`);
    }


    /**
     * @inheritdoc
     */
    public async getAll(loadRequests?: boolean): Promise<IPersistedInvestor[]> {
        return getRepository(PersistedInvestor).find({
            relations: ['investments'].concat(loadRequests ? ['requests'] : []),
        });
    }


    /**
     * @inheritdoc
     */
    public async getOne(id: string, loadRequests?: boolean): Promise<IPersistedInvestor | null> {
        return getRepository(PersistedInvestor)
            .findOne(id)
            .then((result) => result ? result : null);
    }


    /**
     * @inheritdoc
     */
    public async getOneByEmail(email: string, loadRequests?: boolean): Promise<IPersistedInvestor | null> {
        return getRepository(PersistedInvestor)
            .findOne({ email })
            .then((result) => result ? result : null);
    }
}
