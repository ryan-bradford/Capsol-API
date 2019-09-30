import { getRandomInt } from '@shared';
import { PrimaryColumn, Column, BaseEntity, Entity } from 'typeorm';

export enum UserRoles {
    Homeowner,
    Investor,
    Admin,
}

export type TUserRoles =
    UserRoles.Homeowner |
    UserRoles.Investor |
    UserRoles.Admin;


export interface IUser {
    id?: number;
    name: string;
    email: string;
    pwdHash: string;
    role: TUserRoles;
}

@Entity('USER')
export abstract class User implements IUser {

    @PrimaryColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public email: string;

    @Column()
    public role: TUserRoles;

    @Column()
    public pwdHash: string;


    constructor(
        nameOrUser?: string | IUser,
        email?: string,
        role?: TUserRoles,
        pwdHash?: string,
        id?: number,
    ) {
        if (typeof nameOrUser === 'string' || typeof nameOrUser === 'undefined') {
            this.name = nameOrUser || '';
            this.email = email || '';
            this.role = role || UserRoles.Investor;
            this.pwdHash = pwdHash || '';
            this.id = id || getRandomInt();
        } else {
            this.name = nameOrUser.name;
            this.email = nameOrUser.email;
            this.role = nameOrUser.role;
            this.pwdHash = nameOrUser.pwdHash;
            this.id = nameOrUser.id ? nameOrUser.id : getRandomInt();
        }
    }
}
