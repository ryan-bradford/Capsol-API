import { IUserDao } from './UserDao';
import { getRepository } from 'typeorm';
import { getRandomInt } from '@shared';
import { IPersistedHomeowner, PersistedHomeowner, IStorableHomeowner } from '@entities';
import { getDaos } from '@daos';

export class SqlHomeownerDao implements IUserDao<IPersistedHomeowner, IStorableHomeowner> {


    /**
     * @param email
     */
    public async getOne(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        return getRepository(PersistedHomeowner)
            .findOne(typeof emailOrId === 'string' ? { email: emailOrId } : { id: emailOrId })
            .then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(): Promise<IPersistedHomeowner[]> {
        return getRepository(PersistedHomeowner).find();
    }


    /**
     *
     * @param user
     */
    public async add(homeowner: IStorableHomeowner): Promise<IPersistedHomeowner> {
        const newHomeowner = new PersistedHomeowner();
        newHomeowner.contract = undefined;
        newHomeowner.email = homeowner.email;
        newHomeowner.id = getRandomInt();
        newHomeowner.name = homeowner.name;
        newHomeowner.pwdHash = homeowner.pwdHash;
        newHomeowner.admin = false;
        return getRepository(PersistedHomeowner).save(newHomeowner);
    }


    /**
     *
     * @param id
     */
    public async delete(id: number): Promise<void> {
        await getRepository(PersistedHomeowner).delete(id);
        return;
    }
}
