import { Entity, OneToMany } from 'typeorm';
import {
    IPersistedUser, IPersistedInvestment, IPersistedSellRequest,
    PersistedUser, PersistedInvestment, PersistedSellRequest,
} from '@entities';

export interface IPersistedInvestor extends IPersistedUser {
    investments: IPersistedInvestment[];
    sellRequests: IPersistedSellRequest[];
}

@Entity('investor')
export class PersistedInvestor extends PersistedUser implements IPersistedInvestor {

    @OneToMany((type) => PersistedInvestment, (investment) => investment.owner, { onDelete: 'CASCADE' })
    public investments!: IPersistedInvestment[];

}

export function isInvestor(value: IPersistedUser): value is IPersistedInvestor {
    return (value as IPersistedInvestor).investments !== undefined;
}
