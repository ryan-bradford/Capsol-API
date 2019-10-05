import { IPersistedUser, IStoredUser, IStorableUser } from '@entities';

export interface IUserDao<T extends IPersistedUser, R extends IStorableUser> {
    getOne: (emailOrId: string | number) => Promise<T | null>;
    getAll: () => Promise<T[]>;
    add: (user: R) => Promise<T>;
    delete: (id: number) => Promise<void>;
}
