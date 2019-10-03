import { IPersistedUser, IStoredUser } from '@entities';

export interface IUserDao<T extends IPersistedUser, R extends IStoredUser> {
    getOne: (emailOrId: string | number) => Promise<T | null>;
    getAll: () => Promise<T[]>;
    add: (user: R) => Promise<T>;
    delete: (id: number) => Promise<void>;
}
