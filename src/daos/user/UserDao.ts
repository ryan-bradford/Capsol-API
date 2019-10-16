import { IPersistedUser, IStoredUser, IStorableUser } from '@entities';

export interface IUserDao<T extends IPersistedUser, R extends IStorableUser> {
    getOne: (id: string) => Promise<T | null>;
    getOneByEmail: (email: string) => Promise<T | null>;
    getAll: () => Promise<T[]>;
    add: (user: R) => Promise<T>;
    delete: (id: string) => Promise<void>;
}
