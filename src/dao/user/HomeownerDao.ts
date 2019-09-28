import { IUserDao } from './UserDao';
import { IUser, IHomeowner, Homeowner } from '@entities';

export class SqlHomeownerDao implements IUserDao<IHomeowner> {


    /**
     * @param email
     */
    public async getOne(emailOrId: string | number): Promise<IHomeowner | null> {
        return Homeowner.findOne(typeof emailOrId === 'string' ? { email: emailOrId } : { id: emailOrId })
            .then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(): Promise<IHomeowner[]> {
        return Homeowner.find();
    }


    /**
     *
     * @param user
     */
    public async add(homeowner: IHomeowner): Promise<IHomeowner> {
        const newHomeowner = new Homeowner(homeowner);
        return newHomeowner.save();
    }


    /**
     *
     * @param id
     */
    public async delete(email: string): Promise<void> {
        return Homeowner.findOne({ email }).then((result) => {
            if (!result) {
                throw new Error('Not found');
            }
            Homeowner.delete(result.id);
        });
    }
}
