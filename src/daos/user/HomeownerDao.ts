import { IUserDao } from './UserDao';
import { IUser, IHomeowner, Homeowner } from '@entities';
import { createConnection, Connection, getRepository } from 'typeorm';
import { getRandomInt } from '@shared';

export class SqlHomeownerDao implements IUserDao<IHomeowner> {


    /**
     * @param email
     */
    public async getOne(emailOrId: string | number): Promise<IHomeowner | null> {
        return getRepository(Homeowner)
            .findOne(typeof emailOrId === 'string' ? { email: emailOrId } : { id: emailOrId })
            .then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(): Promise<IHomeowner[]> {
        return getRepository(Homeowner).find();
    }


    /**
     *
     * @param user
     */
    public async add(homeowner: IHomeowner): Promise<IHomeowner> {
        const newHomeowner = new Homeowner();
        newHomeowner.contract = homeowner.contract;
        newHomeowner.email = homeowner.email;
        newHomeowner.id = homeowner.id ? homeowner.id : getRandomInt();
        newHomeowner.name = homeowner.name;
        newHomeowner.pwdHash = homeowner.pwdHash;
        newHomeowner.role = homeowner.role;
        return getRepository(Homeowner).save(newHomeowner);
    }


    /**
     *
     * @param id
     */
    public async delete(id: number): Promise<void> {
        getRepository(Homeowner).delete(id);
    }
}
