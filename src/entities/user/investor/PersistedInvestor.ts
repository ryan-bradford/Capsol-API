import { Entity, OneToMany, JoinColumn, ChildEntity } from 'typeorm';
import {
    IPersistedUser, IPersistedInvestment,
    PersistedUser, PersistedInvestment,
} from '@entities';
import { IPersistedRequest, PersistedRequest } from 'src/entities/investment/request/PersistedRequest';
import { IPersistedCashDeposit, PersistedCashDeposit } from 'src/entities/investment/cash/PersistedCashDeposit';

export interface IPersistedInvestor extends IPersistedUser {
    requests: IPersistedRequest[];
    cashDeposits: IPersistedCashDeposit[];
}

@ChildEntity('investor')
export class PersistedInvestor extends PersistedUser implements IPersistedInvestor {

    @OneToMany((type) => PersistedInvestment, (investment) => investment.owner, { onDelete: 'CASCADE' })
    public investments!: IPersistedInvestment[];

    @OneToMany((type) => PersistedRequest, (request) => request.investor, { onDelete: 'CASCADE' })
    public requests!: IPersistedRequest[];

    @OneToMany((type) => PersistedCashDeposit, (investment) => investment.user, { onDelete: 'CASCADE' })
    public cashDeposits!: IPersistedCashDeposit[];

}

export function isInvestor(value: IPersistedUser): value is IPersistedInvestor {
    return (value as any).investments !== undefined || (value as any).type !== 'homeowner';
}
