import { IInvestment, Investment } from './Investment';
import { IUser, User } from '@entities';
import { PrimaryColumn, Column, OneToMany, OneToOne, BaseEntity } from 'typeorm';
import { getRandomInt } from '@shared';

/**
 * Represents that the given user would like to sell the listed investments.
 */
export interface ISellRequest {

    id: number;
    user: IUser;
    amount: number;
    dateCreated: Date;

}


export class SellRequest extends BaseEntity implements ISellRequest {

    @PrimaryColumn()
    public id: number;


    @Column()
    public amount: number;

    @Column()
    public dateCreated: Date;


    @OneToMany((type) => User, (user) => user.id)
    public user: IUser;


    constructor(amount: number, user: IUser) {
        super();
        this.id = getRandomInt();
        this.amount = amount;
        this.user = user;
        this.dateCreated = new Date();
    }

}

