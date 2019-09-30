import { IUser, User, TUserRoles } from './User';
import { IInvestment, Investment } from '../investment/Investment';
import { IPurchaseRequest, ISellRequest } from '../investment/Request';
import { Entity, OneToMany } from 'typeorm';

export interface IInvestor extends IUser {
    investments: IInvestment[];
    // purchaseRequests: IPurchaseRequest[];
    // sellRequests: ISellRequest[];
}

@Entity('INVESTOR')
export class Investor extends User implements IInvestor {

    @OneToMany((type) => Investment, (investment) => investment.owner)
    public investments: IInvestment[];


    // public purchaseRequests: IPurchaseRequest[];
    // public sellRequests: ISellRequest[];


    constructor(
        nameOrUser?: string | IUser | IInvestor,
        email?: string,
        role?: TUserRoles,
        pwdHash?: string,
        id?: number,
        investments?: IInvestment[],
        purchaseRequests?: IPurchaseRequest[],
        sellRequests?: ISellRequest[],
    ) {
        super(nameOrUser, email, role, pwdHash, id);
        if (nameOrUser !== undefined && isInvestor(nameOrUser)) {
            this.investments = nameOrUser.investments ? nameOrUser.investments : [];
            // this.purchaseRequests = nameOrUser.purchaseRequests ? nameOrUser.purchaseRequests : [];
            // this.sellRequests = nameOrUser.sellRequests ? nameOrUser.sellRequests : [];
        } else {
            this.investments = investments ? investments : [];
            // this.purchaseRequests = purchaseRequests ? purchaseRequests : [];
            // this.sellRequests = sellRequests ? sellRequests : [];
        }
    }
}

function isInvestor(user: string | IUser | IInvestor): user is IInvestor {
    return (user as IInvestor).investments !== undefined;
}
