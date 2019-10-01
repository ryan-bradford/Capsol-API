import { IContract, Contract } from '@entities';
import { getRepository } from 'typeorm';

export interface IContractDao {
    getContracts(userId?: number): Promise<IContract[]>;
    getContract(id: number): Promise<IContract>;
}

export class SqlContractDao implements IContractDao {


    public async getContract(id: number): Promise<IContract> {
        return getRepository(Contract).findOne(id).then((contract) => {
            if (!contract) {
                throw new Error('not found');
            }
            return contract;
        });
    }


    public async getContracts(userId?: number): Promise<IContract[]> {
        return getRepository(Contract).find().then((contracts) =>
            contracts.filter((contract) => !userId || contract.homeowner.id === userId));
    }
}
