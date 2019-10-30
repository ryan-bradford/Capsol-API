import {
    PersistedInvestor, IPersistedInvestor,
} from '@entities';
import { Column, ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Represents all the information stored in the database for requests.
 */
export interface IPersistedRequest {
    /**
     * The UUID of the request.
     *
     * @unique
     */
    id: string;
    /**
     * The amount that the request asks for.
     */
    amount: number;
    /**
     * The investor who made this request.
     */
    investor: IPersistedInvestor;
    /**
     * The month this request was made on.
     */
    dateCreated: number;
    /**
     * Whether this is a purchase or sell request.
     */
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
