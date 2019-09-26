import { IUserDao } from './UserService';
import { IUser, IHomeowner, Homeowner } from '@entities';

export class HomeownerService implements IUserDao<IHomeowner> {


    /**
     * @param email
     */
    public async getOne(email: string): Promise<IHomeowner | null> {
        return Homeowner.findOne({ email }).then((result) => result ? result : null);
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
    public async add(homeowner: IHomeowner): Promise<Homeowner> {
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
