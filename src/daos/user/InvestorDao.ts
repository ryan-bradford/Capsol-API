import { IUserDao } from './UserDao';
import { IUser, IInvestor, Investor } from '@entities';
import { getRepository } from 'typeorm';
import { getRandomInt } from '@shared';

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
        return getRepository(Investor).find();
    }


    /**
     *
     * @param user
     */
    public async add(user: IInvestor): Promise<Investor> {
        const newInvestor = new Investor();
        newInvestor.email = user.email;
        newInvestor.id = user.id ? user.id : getRandomInt();
        newInvestor.investments = user.investments;
        newInvestor.name = user.name;
        newInvestor.pwdHash = user.pwdHash;
        newInvestor.role = user.role;
        return getRepository(Investor).save(newInvestor);
    }


    /**
     *
     * @param id
     */
    public async delete(id: number): Promise<void> {
        getRepository(Investor).delete(id);

    }
}
