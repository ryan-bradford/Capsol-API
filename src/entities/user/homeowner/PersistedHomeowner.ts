import { OneToOne, Entity, OneToMany, ChildEntity } from 'typeorm';
import {
    IPersistedUser, IPersistedContract, PersistedUser, PersistedContract,
    PersistedRequest, IPersistedRequest, isInvestor,
} from '@entities';

export interface IPersistedHomeowner extends IPersistedUser {
    contract?: IPersistedContract;
}

@ChildEntity('homeowner')
export class PersistedHomeowner extends PersistedUser implements IPersistedHomeowner {

    @OneToOne(() => PersistedContract, (contract) => contract.homeowner,
        { nullable: true, onDelete: 'CASCADE', eager: true })
    public contract?: IPersistedContract;

    private type = 'homeowner';

}

export function isHomeowner(value: IPersistedUser): value is IPersistedHomeowner {
    return !isInvestor(value);
}
