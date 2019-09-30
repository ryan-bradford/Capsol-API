import { IUser, User, TUserRoles } from './User';
import { IContract, Contract } from '../investment/Contract';
import { OneToOne, BaseEntity, Entity } from 'typeorm';

export interface IHomeowner extends IUser {
    contract?: IContract;
}

@Entity('HOMEOWNER')
export class Homeowner extends User implements IHomeowner {

    @OneToOne((type) => Contract, (contract) => contract.homeowner)
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
