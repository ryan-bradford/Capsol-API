import { getRepository, LessThan } from 'typeorm';
import { IPersistedContract, PersistedContract, IStorableContract, IPersistedInvestment, PersistedInvestment } from '@entities';
import { getDaos } from '@daos';
import { singleton } from 'tsyringe';
import { strict as assert } from 'assert';
import { DaoError } from 'src/shared/error/DaoError';

/**
 * `IContractDao` is a database interface for dealing with contracts.
 */
export interface IContractDao {
    /**
     * Returns all contracts. If the given userId is not undefined, returns only contracts for the given user.
     */
    getContracts(userId?: string): Promise<IPersistedContract[]>;
    /**
     * Returns the contract with the given ID.
     *
     * @throws Error if the contract was not found.
     */
    getContract(id: string): Promise<IPersistedContract | null>;
    /**
     * Returns all investments that are related to the given contractId.
     */
    getInvestmentsForContract(contractId: string): Promise<IPersistedInvestment[]>;
    /**
     * Creates a contract with the information in the given `IStorableContract`.
     *
     * If `dontSave` is true, does not save the contract to the database.
     *
     * @throws Error if the homeowner stored in the contract is not found.
     */
    createContract(contract: IStorableContract, dontSave?: boolean): Promise<IPersistedContract>;
    /**
     * Saves the firstPaymentDate in the given contract to the database.
     */
    saveContract(contract: IPersistedContract): Promise<void>;
    // TODO: extract to a service better.
    /**
     * Returns how many contracts will be served before the contract with the given `unsoldAmount`.
     */
    getContractPositionInQueue(unsoldAmount: number): Promise<number>;
}

/**
 * `SqlContractDao` is a specific implementation of `IContractDao` for interfacing with MySQL using TypeORM.
 */
@singleton()
export class SqlContractDao implements IContractDao {


    /**
     * @inheritdoc
     */
    public async getContract(id: string): Promise<IPersistedContract | null> {
        return getRepository(PersistedContract).findOne(id, {
            relations: ['homeowner', 'investments'],
        }).then((returnVal) => returnVal ? returnVal : null);
    }


    /**
     * @inheritdoc
     */
    public async getContracts(userId?: string): Promise<IPersistedContract[]> {
        return getRepository(PersistedContract).find({
            relations: ['homeowner', 'investments'],
        }).then((contracts: IPersistedContract[]) =>
            contracts.filter((contract) => !userId || contract.homeowner.id === userId));
    }


    /**
     * @inheritdoc
     */
    public async getInvestmentsForContract(contractId: string): Promise<IPersistedInvestment[]> {
        return getRepository(PersistedInvestment).find({
            relations: ['contract', 'owner'],
            where: { contractId },
        });
    }


    /**
     * @inheritdoc
     */
    public async createContract(contract: IStorableContract, dontSave?: boolean): Promise<IPersistedContract> {
        const daos = await getDaos();
        const homeownerDao = new daos.SqlHomeownerDao();
        const newContract = new PersistedContract();
        const homeowner = await homeownerDao.getOne(contract.homeownerId);
        if (!homeowner) {
            throw new DaoError(`Homeowner with id ${contract.homeownerId} not found.`);
        }
        newContract.homeowner = homeowner;
        newContract.investments = [];
        newContract.totalLength = contract.length;
        newContract.monthlyPayment = contract.monthlyPayment;
        newContract.saleAmount = contract.saleAmount;
        if (dontSave !== true) {
            await getRepository(PersistedContract).insert(newContract);
            homeowner.contract = newContract;
        }
        return newContract;
    }


    /**
     * @inheritdoc
     */
    public async saveContract(contract: IPersistedContract): Promise<void> {
        const result = await getRepository(PersistedContract).update(contract.id, {
            firstPaymentDate: contract.firstPaymentDate as number,
        });
        assert(result.raw.affectedRows === 1, `Did not update contract with ID ${contract.id}`);
        return;
    }


    /**
     * @inheritdoc
     */
    public async  getContractPositionInQueue(unsoldAmount: number): Promise<number> {
        const allContracts = await this.getContracts();
        return allContracts.filter((contract) => contract.unsoldAmount() < unsoldAmount).length + 1;
    }
}
