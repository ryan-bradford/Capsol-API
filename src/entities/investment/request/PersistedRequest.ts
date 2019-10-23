import {
    PersistedInvestor, IPersistedInvestor,
} from '@entities';
import { PrimaryColumn, Column, JoinColumn, ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';


export interface IPersistedRequest {

    id: string;
    amount: number;
    investor: IPersistedInvestor;
    dateCreated: number;
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
    public dateCreated!: number;

    @ManyToOne((type) => PersistedInvestor, (investor) => investor.requests, { onDelete: 'CASCADE', eager: true })
    public investor!: IPersistedInvestor;

}
