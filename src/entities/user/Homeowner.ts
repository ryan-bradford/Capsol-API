import { IUser, User, TUserRoles } from './User';
import { IContract } from '../investment/Contract';

export interface IHomeowner extends IUser {
    contract?: IContract;
}

export class Homeowner extends User implements IHomeowner {
    public contract?: IContract;


    constructor(
        nameOrUser?: string | IUser,
        email?: string,
        role?: TUserRoles,
        pwdHash?: string,
        id?: number,
        contract?: IContract,
    ) {
        super(nameOrUser, email, role, pwdHash, id);
        this.contract = contract;
    }
}
