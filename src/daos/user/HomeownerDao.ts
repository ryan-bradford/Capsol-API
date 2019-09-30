import { IUserDao } from './UserDao';
import { IUser, IHomeowner, Homeowner } from '@entities';
import { createConnection, Connection, getRepository } from 'typeorm';

export class SqlHomeownerDao implements IUserDao<IHomeowner> {


    /**
     * @param email
     */
    public async getOne(emailOrId: string | number): Promise<IHomeowner | null> {
        return (getRepository(Homeowner))
            .findOne(typeof emailOrId === 'string' ? { email: emailOrId } : { id: emailOrId })
            .then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(): Promise<IHomeowner[]> {
        return (getRepository(Homeowner)).find();
    }


    /**
     *
     * @param user
     */
    public async add(homeowner: IHomeowner): Promise<IHomeowner> {
        const newHomeowner = new Homeowner(homeowner);
        return (getRepository(Homeowner)).save(newHomeowner);
    }


    /**
     *
     * @param id
     */
    public async delete(email: string): Promise<void> {
        return (getRepository(Homeowner)).findOne({ email }).then((result) => {
            if (!result) {
                throw new Error('Not found');
            }
            (getRepository(Homeowner)).delete(result.id);
        });
    }
}
