import {
    IPersistedUser, PersistedInvestor, IPersistedInvestor,
    PersistedHomeowner, IPersistedHomeowner, isInvestor,
} from '@entities';
import { PrimaryColumn, Column, OneToMany } from 'typeorm';


export interface IPersistedRequest {

    id: number;
    amount: number;
    user: IPersistedUser;
    dateCreated: Date;

}

export abstract class APersistedRequest implements IPersistedRequest {

    @PrimaryColumn()
    public id!: number;

    @Column()
    public amount!: number;

    @Column()
    public dateCreated!: Date;

    @OneToMany((type) => PersistedInvestor, (investor: PersistedInvestor) => investor.id)
    public investor?: IPersistedInvestor;

    @OneToMany((type) => PersistedHomeowner, (homeowner: PersistedHomeowner) => homeowner.id)
    public homeowner?: IPersistedHomeowner;

    set user(user: IPersistedUser) {
        if (isInvestor(user)) {
            this.investor = user as IPersistedInvestor;
        } else {
            this.homeowner = user as IPersistedHomeowner;
        }
    }

    get user(): IPersistedUser {
        const returnVal = this.investor ? this.investor : this.homeowner;
        if (!returnVal) {
            throw new Error('Invalid user');
        }
        return returnVal;
    }
}
