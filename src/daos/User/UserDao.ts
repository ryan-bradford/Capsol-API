import { IUser } from '@entities';


export interface IUserDao<T extends IUser> {
    getOne: (email: string) => Promise<T | null>;
    getAll: () => Promise<T[]>;
    add: (user: T) => Promise<void>;
    delete: (email: string) => Promise<void>;
}

export class UserDao implements IUserDao<IUser> {


    /**
     * @param email
     */
    public async getOne(email: string): Promise<IUser | null> {
        // TODO
        return [] as any;
    }


    /**
     *
     */
    public async getAll(): Promise<IUser[]> {
        // TODO
        return [] as any;
    }


    /**
     *
     * @param user
     */
    public async add(user: IUser): Promise<void> {
        // TODO
        return {} as any;
    }


    /**
     *
     * @param id
     */
    public async delete(email: string): Promise<void> {
        // TODO
        return {} as any;
    }
}
