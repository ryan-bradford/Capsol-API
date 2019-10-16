import {
    IPersistedUser, PersistedInvestor, IPersistedInvestor,
    PersistedHomeowner, IPersistedHomeowner, isInvestor, PersistedUser,
} from '@entities';
import { PrimaryColumn, Column, JoinColumn, ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';


export interface IPersistedRequest {

    id: string;
    amount: number;
    investor: IPersistedUser;
    dateCreated: Date;
    type: 'purchase' | 'sell';

}

@Entity('request')
export class PersistedRequest implements IPersistedRequest {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public type!: 'purchase' | 'sell';

    @Column()
    public amount!: number;

    @Column()
    public dateCreated!: Date;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.requests, { onDelete: 'CASCADE' })
    public investor!: IPersistedInvestor;

}
