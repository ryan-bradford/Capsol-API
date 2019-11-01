import { Entity, OneToMany, JoinColumn, ChildEntity } from 'typeorm';
import {
    IPersistedUser, IPersistedInvestment,
    PersistedUser, PersistedInvestment,
} from '@entities';
import { IPersistedRequest, PersistedRequest } from 'src/entities/investment/request/PersistedRequest';
import { IPersistedCashDeposit, PersistedCashDeposit } from 'src/entities/investment/cash/PersistedCashDeposit';

/**
 * `IPersistedInvestor` is a `IPersistedUser` that can have investments, requests, and cash deposits.
 */
export interface IPersistedInvestor extends IPersistedUser {
    /**
     * All the requests that this investor has made.
     */
    requests: IPersistedRequest[];
    /**
     * All the cash this user has deposited into the app.
     */
    cashDeposits: IPersistedCashDeposit[];
    /**
     * All the investments this user owns or has owned.
     */
    investments: IPersistedInvestment[];
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
