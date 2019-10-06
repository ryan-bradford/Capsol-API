import { OneToOne, Entity, JoinColumn } from 'typeorm';
import { IPersistedUser, IPersistedContract, PersistedUser, PersistedContract } from '@entities';

export interface IPersistedHomeowner extends IPersistedUser {
    contract?: IPersistedContract;
}

@Entity('homeowner')
export class PersistedHomeowner extends PersistedUser implements IPersistedHomeowner {

    @OneToOne((type) => PersistedContract, (contract) => contract.homeowner, { nullable: true, onDelete: 'CASCADE' })
    public contract?: IPersistedContract;

}
