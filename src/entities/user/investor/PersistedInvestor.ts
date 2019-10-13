import { Entity, OneToMany, JoinColumn, ChildEntity } from 'typeorm';
import {
    IPersistedUser, IPersistedInvestment,
    PersistedUser, PersistedInvestment,
} from '@entities';
import { IPersistedRequest, PersistedRequest } from 'src/entities/investment/request/PersistedRequest';
import { IPersistedHomeowner } from '../homeowner/PersistedHomeowner';

export interface IPersistedInvestor extends IPersistedUser {
    requests: IPersistedRequest[];
    readonly portfolioValue: number;
}

@ChildEntity('investor')
export class PersistedInvestor extends PersistedUser implements IPersistedInvestor {

    @OneToMany((type) => PersistedInvestment, (investment) => investment.owner, { onDelete: 'CASCADE' })
    public investments!: IPersistedInvestment[];

    @OneToMany((type) => PersistedRequest, (request) => request.investor, { onDelete: 'CASCADE', eager: true })
    public requests!: IPersistedRequest[];

    get portfolioValue(): number {
        let total = 0;
        this.investments.forEach((investment) => {
            total += investment.value;
        });

        this.requests.forEach((request) => {
            total += request.amount;
        });
        return total;
    }

    private type = 'investor';

}

export function isInvestor(value: IPersistedUser): value is IPersistedInvestor {
    return (value as any).type === 'investor';
}
