import { IUserDao, UserDao } from './UserDao';
import { IInvestor, UserRoles } from '@entities';


export interface IInvestorDao extends IUserDao<IInvestor> {
    addFunds(email: string, amount: number): Promise<void>;
    sellInvestments(email: string, amount: number): Promise<void>;
}

export class InvestorDao extends UserDao implements IInvestorDao {


    /**
     * @param email
     */
    public async getOne(email: string): Promise<IInvestor | null> {
        // TODO
        return super.getOne(email).then((user) => {
            if (user) {
                if (user.role === UserRoles.Investor) {
                    return user as IInvestor;
                }
            }
            throw new Error('user not found');
        });
    }


    /**
     *
     */
    public async getAll(): Promise<IInvestor[]> {
        // TODO
        return super.getAll().then((users) => {
            return users.filter((user) => user && user.role === UserRoles.Investor).map((user) => user as IInvestor);
        });
    }


    /**
     *
     * @param user
     */
    public async add(user: IInvestor): Promise<void> {
        // TODO
        return super.add(user);
    }


    /**
     *
     * @param id
     */
    public async delete(id: number): Promise<void> {
        // TODO
        return super.delete(id);
    }


    public async addFunds(email: string, amount: number): Promise<void> {
        // TODO
    }


    public async sellInvestments(email: string, amount: number): Promise<void> {
        // TODO
    }


}
