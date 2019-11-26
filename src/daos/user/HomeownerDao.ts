import { IUserDao } from './UserDao';
import { getRepository } from 'typeorm';
import { IPersistedHomeowner, PersistedHomeowner, IStorableHomeowner } from '@entities';
import bcrypt from 'bcryptjs';
import { singleton } from 'tsyringe';
import { strict as assert } from 'assert';

/**
 * `SqlHomeownerDao` is a specific implementation of `IUserDao` for `IPersistedHomeowner`s
 *  for interfacing with MySQL using TypeORM.
 */
@singleton()
export class SqlHomeownerDao implements IUserDao<IPersistedHomeowner, IStorableHomeowner> {


    /**
     * @inheritdoc
     */
    public async add(homeowner: IStorableHomeowner): Promise<IPersistedHomeowner> {
        const newHomeowner = new PersistedHomeowner();
        newHomeowner.contract = undefined;
        newHomeowner.email = homeowner.email;
        newHomeowner.name = homeowner.name;
        newHomeowner.pwdHash = bcrypt.hashSync(homeowner.password, bcrypt.genSaltSync());
        newHomeowner.admin = false;
        await getRepository(PersistedHomeowner).insert(newHomeowner);
        return newHomeowner;
    }


    /**
     * @inheritdoc
     */
    public async delete(id: string): Promise<void> {
        const result = await getRepository(PersistedHomeowner).delete(id);
        assert(result.affected === 1, `Did not delete homeowner row with ID ${id}`);
    }


    /**
     * @inheritdoc
     */
    public async getAll(): Promise<IPersistedHomeowner[]> {
        return getRepository(PersistedHomeowner).find({
            relations: ['contract', 'contract.investments'],
        });
    }


    /**
     * @inheritdoc
     */
    public async getOne(id: string): Promise<IPersistedHomeowner | null> {
        return getRepository(PersistedHomeowner)
            .findOne(id, {
                relations: ['contract', 'contract.investments'],
            })
            .then((result) => result ? result : null);
    }


    /**
     * @inheritdoc
     */
    public async getOneByEmail(email: string, loadRequests?: boolean): Promise<IPersistedHomeowner | null> {
        return getRepository(PersistedHomeowner)
            .findOne({ email }, {
                relations: ['contract', 'contract.investments'],
            })
            .then((result) => result ? result : null);
    }
}
