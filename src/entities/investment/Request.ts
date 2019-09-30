import { IUser } from '@entities';
import { Column, PrimaryColumn, OneToMany, BaseEntity, Entity } from 'typeorm';
import { User } from '../user/User';
import { getRandomInt } from '@shared';
import { IInvestor, Investor } from '../user/Investor';

export interface IRequest {

    id: number;
    amount: number;
    user: IUser;
    dateCreated: Date;

}

export abstract class ARequest implements IRequest {

    @PrimaryColumn()
    public id: number;


    @Column()
    public amount: number;

    @Column()
    public dateCreated: Date;


    @OneToMany((type) => User, (user) => user.id)
    public user: IUser;


    constructor(amount: number, user: IUser) {
        this.id = getRandomInt();
        this.amount = amount;
        this.user = user;
        this.dateCreated = new Date();
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IPurchaseRequest extends IRequest {
    user: IInvestor;
}

// tslint:disable-next-line: no-empty-interface
export interface ISellRequest extends IRequest { }

// tslint:disable-next-line: max-classes-per-file
@Entity('PURCHASE_REQUEST')
export class PurchaseRequest extends ARequest implements IPurchaseRequest {


    @OneToMany((type) => Investor, (user) => user.id)
    public user: IInvestor;


    constructor(amount: number, user: IInvestor) {
        super(amount, user);
        this.user = user;
    }
}

// tslint:disable-next-line: max-classes-per-file
@Entity('SELL_REQUEST')
export class SellRequest extends ARequest implements ISellRequest { }
