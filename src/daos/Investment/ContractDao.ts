import { IContract } from '@entities';

export interface IContractDao {
    createContract(amount: number, interestRate: number, years: number, userId: number): Promise<IContract>;
    getContracts(userId?: number): Promise<IContract[]>;
    getContract(id: number): Promise<IContract>;
}

export class ContractDao implements IContractDao {


    public async getContract(id: number): Promise<IContract> {
        throw new Error('Method not implemented.');
    }


    public async getContracts(userId?: number): Promise<IContract[]> {
        throw new Error('Method not implemented.');
    }


    public async createContract(amount: number, interestRate: number, years: number): Promise<IContract> {
        throw new Error('Method not implemented.');
    }

}
