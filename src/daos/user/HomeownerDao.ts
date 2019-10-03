import { IUserDao } from './UserDao';
import { getRepository } from 'typeorm';
import { getRandomInt } from '@shared';
import { IPersistedHomeowner, IStoredHomeowner, PersistedHomeowner } from '@entities';
import { SqlContractDao } from '@daos';

export class SqlHomeownerDao implements IUserDao<IPersistedHomeowner, IStoredHomeowner> {


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
    public async add(homeowner: IStoredHomeowner): Promise<IPersistedHomeowner> {
        const contractDao = new SqlContractDao();
        const newHomeowner = new PersistedHomeowner();
        newHomeowner.contract = homeowner.contract ?
            await contractDao.getContract(homeowner.contract.id) : undefined;
        newHomeowner.email = homeowner.email;
        newHomeowner.id = homeowner.id ? homeowner.id : getRandomInt();
        newHomeowner.name = homeowner.name;
        newHomeowner.pwdHash = homeowner.pwdHash;
        return getRepository(PersistedHomeowner).save(newHomeowner);
    }


    /**
     *
     * @param id
     */
    public async delete(id: number): Promise<void> {
        getRepository(PersistedHomeowner).delete(id);
    }
}
