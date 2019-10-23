import { IUserDao } from './UserDao';
import { getRepository } from 'typeorm';
import { getRandomInt } from '@shared';
import { IPersistedHomeowner, PersistedHomeowner, IStorableHomeowner } from '@entities';
import bcrypt from 'bcrypt';
import { singleton } from 'tsyringe';

@singleton()
export class SqlHomeownerDao implements IUserDao<IPersistedHomeowner, IStorableHomeowner> {


    /**
     * @param email
     */
    public async getOne(id: string): Promise<IPersistedHomeowner | null> {
        return getRepository(PersistedHomeowner)
            .findOne(id)
            .then((result) => result ? result : null);
    }


    /**
     * @param email
     */
    public async getOneByEmail(email: string, loadRequests?: boolean): Promise<IPersistedHomeowner | null> {
        return getRepository(PersistedHomeowner)
            .findOne({ email })
            .then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(): Promise<IPersistedHomeowner[]> {
        return getRepository(PersistedHomeowner).find({
            relations: ['contract'],
        });
    }


    /**
     *
     * @param user
     */
    public async add(homeowner: IStorableHomeowner): Promise<IPersistedHomeowner> {
        const newHomeowner = new PersistedHomeowner();
        newHomeowner.contract = undefined;
        newHomeowner.email = homeowner.email;
        newHomeowner.name = homeowner.name;
        newHomeowner.pwdHash = bcrypt.hashSync(homeowner.password, bcrypt.genSaltSync());
        newHomeowner.admin = false;
        return getRepository(PersistedHomeowner).save(newHomeowner);
    }


    /**
     *
     * @param id
     */
    public async delete(id: string): Promise<void> {
        await getRepository(PersistedHomeowner).delete(id);
        return;
    }
}
