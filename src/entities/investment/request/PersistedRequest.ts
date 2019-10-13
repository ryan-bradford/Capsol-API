import {
    IPersistedUser, PersistedInvestor, IPersistedInvestor,
    PersistedHomeowner, IPersistedHomeowner, isInvestor, PersistedUser,
} from '@entities';
import { PrimaryColumn, Column, JoinColumn, ManyToOne, Entity } from 'typeorm';


export interface IPersistedRequest {

    id: number;
    amount: number;
    investor: IPersistedUser;
    dateCreated: Date;
    type: 'purchase' | 'sell';

}

@Entity('request')
export class PersistedRequest implements IPersistedRequest {

    @PrimaryColumn()
    public id!: number;

    @Column()
    public type!: 'purchase' | 'sell';

    @Column()
    public amount!: number;

    @Column()
    public dateCreated!: Date;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.requests, { onDelete: 'CASCADE' })
    public investor!: IPersistedInvestor;

}
