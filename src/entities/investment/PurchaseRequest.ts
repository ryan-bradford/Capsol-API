import { IUser } from '@entities';
import { Column, PrimaryColumn, OneToMany, BaseEntity } from 'typeorm';
import { User } from '../user/User';
import { getRandomInt } from '@shared';
import { IInvestor } from '../user/Investor';

export interface IPurchaseRequest {

    id: number;
    amount: number;
    user: IUser;
    dateCreated: Date;

}

export class PurchaseRequest extends BaseEntity implements IPurchaseRequest {

    @PrimaryColumn()
    public id: number;


    @Column()
    public amount: number;

    @Column()
    public dateCreated: Date;


    @OneToMany((type) => User, (user) => user.id)
    public user: IInvestor;


    constructor(amount: number, user: IInvestor) {
        super();
        this.id = getRandomInt();
        this.amount = amount;
        this.user = user;
        this.dateCreated = new Date();
    }

}
