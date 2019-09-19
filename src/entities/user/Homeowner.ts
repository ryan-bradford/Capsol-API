import { IUser, User, TUserRoles } from './User';
import { IContract, Contract } from '../investment/Contract';

export interface IHomeowner extends IUser {
    contract?: IContract;
    createContract(amount: number, length: number): IContract;
}

export class Homeowner extends User implements IHomeowner {

    public contract?: IContract | undefined;


    constructor(
        nameOrUser?: string | IUser,
        email?: string,
        role?: TUserRoles,
        pwdHash?: string,
    ) {
        super(nameOrUser, email, role, pwdHash);
    }


    public createContract(amount: number, length: number): IContract {
        const toCreate = new Contract(amount, length, (.04 + 1 / length) * amount);
        this.contract = toCreate;
        return toCreate;
    }
}
