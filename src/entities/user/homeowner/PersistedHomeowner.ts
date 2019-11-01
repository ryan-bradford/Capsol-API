import { OneToOne, ChildEntity } from 'typeorm';
import {
    IPersistedUser, IPersistedContract, PersistedUser, PersistedContract, isInvestor,
} from '@entities';

/**
 * `IPersistedHomeowner` is a `IPersistedUser` that can have a contract.
 */
export interface IPersistedHomeowner extends IPersistedUser {
    /**
     * The contract that this homeowner owns.
     * Undefined if this homeowner has not signed up yet.
     */
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
