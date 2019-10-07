import {
    IPersistedUser, PersistedInvestor, IPersistedInvestor,
    PersistedHomeowner, IPersistedHomeowner, isInvestor,
} from '@entities';
import { PrimaryColumn, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';


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

    @ManyToOne((type) => PersistedInvestor, (investor: PersistedInvestor) => investor,
        { onDelete: 'CASCADE', nullable: true })
    public investor?: IPersistedInvestor;

    @ManyToOne((type) => PersistedHomeowner, (homeowner: PersistedHomeowner) => homeowner,
        { onDelete: 'CASCADE', nullable: true })
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
