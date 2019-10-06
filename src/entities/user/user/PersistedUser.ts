import { PrimaryColumn, Column, OneToMany } from 'typeorm';
import { IPersistedPurchaseRequest, PersistedPurchaseRequest } from '@entities';

export interface IPersistedUser {
    id: number;
    name: string;
    email: string;
    pwdHash: string;
    purchaseRequests: IPersistedPurchaseRequest[];
    readonly admin: boolean;
}

export abstract class PersistedUser implements IPersistedUser {

    @PrimaryColumn()
    public id!: number;

    @Column()
    public name!: string;

    @Column()
    public email!: string;

    @Column()
    public pwdHash!: string;

    @Column()
    public admin!: boolean;

    @OneToMany((type) => PersistedPurchaseRequest, (request) => request.user, { onDelete: 'CASCADE' })
    public purchaseRequests!: IPersistedPurchaseRequest[];


}
