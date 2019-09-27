import { IUser } from '@entities';

export interface IUserDao<T extends IUser> {
    getOne: (email: string) => Promise<T | null>;
    getAll: () => Promise<T[]>;
    add: (user: T) => Promise<T>;
    delete: (email: string) => Promise<void>;
}
