import { getRepository } from 'typeorm';
import { IPersistedContract, PersistedContract, IStorableContract } from '@entities';
import { getRandomInt } from '@shared';
import { getDaos } from '@daos';

export interface IContractDao {
    getContracts(userId?: number): Promise<IPersistedContract[]>;
    getContract(id: number): Promise<IPersistedContract>;
    createContract(contract: IStorableContract): Promise<IPersistedContract>;
    saveContract(contract: IPersistedContract): Promise<void>;
}

export class SqlContractDao implements IContractDao {


    public async getContract(id: number): Promise<IPersistedContract> {
        return getRepository(PersistedContract).findOne(id, {
            relations: ['homeowner', 'investments'],
        }).then((contract) => {
            if (!contract) {
                throw new Error('not found');
            }
            return contract;
        });
    }


    public async getContracts(userId?: number): Promise<IPersistedContract[]> {
        return getRepository(PersistedContract).find({
            relations: ['homeowner', 'investments'],
        }).then((contracts: IPersistedContract[]) =>
            contracts.filter((contract) => !userId || contract.homeowner.id === userId));
    }


    public async createContract(contract: IStorableContract): Promise<IPersistedContract> {
        const daos = await getDaos();
        const homeownerDao = new daos.SqlHomeownerDao();
        const newContract = new PersistedContract();
        newContract.id = getRandomInt();
        const homeowner = await homeownerDao.getOne(contract.homeownerId);
        if (!homeowner) {
            throw new Error('Bad contract homeowner');
        }
        newContract.homeowner = homeowner;
        newContract.investments = [];
        newContract.length = contract.length;
        newContract.monthlyPayment = contract.monthlyPayment;
        newContract.saleAmount = contract.saleAmount;
        await getRepository(PersistedContract).save(newContract);
        homeowner.contract = newContract;
        return newContract;
    }


    public async saveContract(contract: IPersistedContract): Promise<void> {
        await getRepository(PersistedContract).save(contract);
        return;
    }
}
