import { IUserDao } from './UserDao';
import { IUser, IInvestor, Investor } from '@entities';
import { getRepository } from 'typeorm';

export class SqlInvestorDao implements IUserDao<IInvestor> {


    /**
     * @param email
     */
    public async getOne(emailOrId: string | number): Promise<IInvestor | null> {
        return getRepository(Investor)
            .findOne(typeof emailOrId === 'string' ? { email: emailOrId } : { id: emailOrId })
            .then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(): Promise<IInvestor[]> {
        return (getRepository(Investor)).find();
    }


    /**
     *
     * @param user
     */
    public async add(user: IInvestor): Promise<Investor> {
        const newInvestor = new Investor(user);
        return (getRepository(Investor)).save(newInvestor);
    }


    /**
     *
     * @param id
     */
    public async delete(email: string): Promise<void> {
        return (getRepository(Investor)).findOne({ email }).then((result) => {
            if (!result) {
                throw new Error('Not found');
            }
            (getRepository(Investor)).delete(result.id);
        });
    }
}
