import { IUser, User, IContract, Contract } from '@entities';
import { OneToOne, Entity } from 'typeorm';

export interface IHomeowner extends IUser {
    contract?: IContract;
}

@Entity()
export class Homeowner extends User implements IHomeowner {

    @OneToOne((type) => Contract, (contract) => contract.homeowner)
    public contract?: IContract;

}
