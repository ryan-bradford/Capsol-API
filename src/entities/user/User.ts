import { PrimaryColumn, Column, OneToMany } from 'typeorm';
import { PurchaseRequest, IPurchaseRequest } from '@entities';

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
    purchaseRequests: IPurchaseRequest[];
}

export abstract class User implements IUser {

    @PrimaryColumn()
    public id!: number;

    @Column()
    public name!: string;

    @Column()
    public email!: string;

    @Column()
    public role!: TUserRoles;

    @Column()
    public pwdHash!: string;

    @OneToMany((type) => PurchaseRequest, (request) => request.user)
    public purchaseRequests!: IPurchaseRequest[];

}
