import { IsEmail, Length } from 'class-validator';

/**
 * All the information needed to create a user.
 */
export interface IStorableUser {
    /**
     * The email of this user.
     *
     * @unique
     */
    email: string;
    /**
     * The full name of this user.
     */
    name: string;
    /**
     * The password of this user as plain text.
     */
    password: string;
}

export abstract class StorableUser implements IStorableUser {

    @IsEmail()
    public email: string;

    public name: string;

    @Length(8)
    public password: string;


    constructor(name: string, email: string, password: string) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
