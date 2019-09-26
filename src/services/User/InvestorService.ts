import { IUserDao } from './UserService';
import { IUser, IInvestor, Investor } from '@entities';

export class InvestorService implements IUserDao<IInvestor> {


    /**
     * @param email
     */
    public async getOne(email: string): Promise<IInvestor | null> {
        return Investor.findOne({ email }).then((result) => result ? result : null);
    }


    /**
     *
     */
    public async getAll(): Promise<IInvestor[]> {
        return Investor.find();
    }


    /**
     *
     * @param user
     */
    public async add(user: IInvestor): Promise<Investor> {
        const newInvestor = new Investor(user);
        return Investor.save(newInvestor);
    }


    /**
     *
     * @param id
     */
    public async delete(email: string): Promise<void> {
        return Investor.findOne({ email }).then((result) => {
            if (!result) {
                throw new Error('Not found');
            }
            Investor.delete(result.id);
        });
    }
}
