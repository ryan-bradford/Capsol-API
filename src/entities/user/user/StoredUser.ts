import { IPersistedUser } from './PersistedUser';
import { strict as assert, AssertionError } from 'assert';

/**
 * The information that should be made public about a user.
 */
export interface IStoredUser {
    /**
     * The email of this user.
     *
     * @unique
     */
    email: string;
    /**
     * The ID of this user.
     *
     * @unique
     */
    id: string;
    /**
     * The full name of this user.
     */
    name: string;
    /**
     * The hashed password of this user.
     */
    pwdHash: string;
}

export abstract class StoredUser implements IStoredUser {
    public email: string;

    public id: string;
    public name: string;
    public pwdHash: string;


    constructor(id: string | IPersistedUser, name?: string, email?: string, pwdHash?: string) {
        if (typeof id === 'string') {
            if (!name || !email || !pwdHash) {
                throw new AssertionError();
            }
            this.id = id;
            this.name = name;
            this.email = email;
            this.pwdHash = pwdHash;
        } else {
            this.id = id.id;
            this.name = id.name;
            this.email = id.email;
            this.pwdHash = id.pwdHash;
        }
    }
}
