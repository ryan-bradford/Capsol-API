import { IUser, User } from '@entities';
import { Column, PrimaryColumn, OneToMany, Entity } from 'typeorm';
import { IInvestor, Investor } from '../user/Investor';
import { IHomeowner, Homeowner } from '../user/Homeowner';
import { UserRoles } from '../user/User';

export interface IRequest {

    id: number;
    amount: number;
    user: IUser;
    dateCreated: Date;

}

export abstract class ARequest implements IRequest {

    @PrimaryColumn()
    public id!: number;

    @Column()
    public amount!: number;

    @Column()
    public dateCreated!: Date;

    @OneToMany((type) => Investor, (investor: Investor) => investor.id)
    public investor?: IInvestor;

    @OneToMany((type) => Homeowner, (homeowner: Homeowner) => homeowner.id)
    public homeowner?: IHomeowner;

    set user(user: IUser) {
        if (user.role === UserRoles.Investor) {
            this.investor = user as IInvestor;
        } else {
            this.homeowner = user as IHomeowner;
        }
    }

    get user(): IUser {
        const returnVal = this.investor ? this.investor : this.homeowner;
        if (!returnVal) {
            throw new Error('Invalid user');
        }
        return returnVal;
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IPurchaseRequest extends IRequest { }

// tslint:disable-next-line: no-empty-interface
export interface ISellRequest extends IRequest { }

// tslint:disable-next-line: max-classes-per-file
@Entity()
export class PurchaseRequest extends ARequest implements IPurchaseRequest { }

// tslint:disable-next-line: max-classes-per-file
@Entity()
export class SellRequest extends ARequest implements ISellRequest { }
