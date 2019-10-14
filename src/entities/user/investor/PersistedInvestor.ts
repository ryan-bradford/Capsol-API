import { Entity, OneToMany, JoinColumn, ChildEntity } from 'typeorm';
import {
    IPersistedUser, IPersistedInvestment,
    PersistedUser, PersistedInvestment,
} from '@entities';
import { IPersistedRequest, PersistedRequest } from 'src/entities/investment/request/PersistedRequest';
import { IPersistedHomeowner } from '../homeowner/PersistedHomeowner';
import { IStoredInvestor, StoredInvestor } from './StoredInvestor';

export interface IPersistedInvestor extends IPersistedUser {
    requests: IPersistedRequest[];
}

@ChildEntity('investor')
export class PersistedInvestor extends PersistedUser implements IPersistedInvestor {

    @OneToMany((type) => PersistedInvestment, (investment) => investment.owner, { onDelete: 'CASCADE' })
    public investments!: IPersistedInvestment[];

    @OneToMany((type) => PersistedRequest, (request) => request.investor, { onDelete: 'CASCADE' })
    public requests!: IPersistedRequest[];

}

export function isInvestor(value: IPersistedUser): value is IPersistedInvestor {
    return (value as any).investments !== undefined || (value as any).type !== 'homeowner';
}
