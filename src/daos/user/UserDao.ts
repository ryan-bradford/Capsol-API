import { IPersistedUser, IStoredUser, IStorableUser } from '@entities';

/**
 * `IUserDao` is a database interface for dealing with users of some given type.
 */
export interface IUserDao<T extends IPersistedUser, R extends IStorableUser> {
    /**
     * Returns the user associated with the given ID. Null if not found.
     */
    getOne: (id: string) => Promise<T | null>;
    /**
     * Returns the user associated with the given email. Null if not found.
     */
    getOneByEmail: (email: string) => Promise<T | null>;
    /**
     * Returns every user in the database.
     */
    getAll: () => Promise<T[]>;
    /**
     * Creates a new user with the information associated with the given user.
     */
    add: (user: R) => Promise<T>;
    /**
     * Deletes the user associated with the given ID.
     *
     * @throws Error if the user was not found.
     */
    delete: (id: string) => Promise<void>;
}
