import { getRepository } from 'typeorm';
import { IPersistedContract, PersistedContract } from '@entities';

export interface IContractDao {
    getContracts(userId?: number): Promise<IPersistedContract[]>;
    getContract(id: number): Promise<IPersistedContract>;
}

export class SqlContractDao implements IContractDao {


    public async getContract(id: number): Promise<IPersistedContract> {
        return getRepository(PersistedContract).findOne(id).then((contract) => {
            if (!contract) {
                throw new Error('not found');
            }
            return contract;
        });
    }


    public async getContracts(userId?: number): Promise<IPersistedContract[]> {
        return getRepository(PersistedContract).find().then((contracts) =>
            contracts.filter((contract) => !userId || contract.homeowner.id === userId));
    }
}
