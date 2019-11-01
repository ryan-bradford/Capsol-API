import { getRepository } from 'typeorm';
import { IPersistedInvestment, IStorableInvestment, PersistedInvestment, IPersistedInvestor, StorableInvestment } from '@entities';
import { getDaos } from '@daos';
import { singleton } from 'tsyringe';
import { strict as assert } from 'assert';
import { DaoError } from 'src/shared/error/DaoError';

/**
 * `IInvestmentDao` is a database interface for dealing with investments.
 */
export interface IInvestmentDao {
    /**
     * Returns the investment associated with the given ID, or null if the investment was not found.
     */
    getInvestment(id: string): Promise<IPersistedInvestment | null>;
    /**
     * Returns all investments. If the given userId is not undefined, removed all investments not owned by the user.
     */
    getInvestments(userId?: string): Promise<IPersistedInvestment[]>;
    /**
     * Creates an investment with the information stored in the given investment.
     *
     * @throws Error if the investment contained information that did not exist.
     */
    createInvestment(investment: IStorableInvestment, date: number): Promise<IPersistedInvestment>;
    /**
     * Deletes the investment with the given ID.
     *
     * @throws Error if the investment did not exist.
     */
    deleteInvestment(id: string): Promise<void>;
    // TODO: move to service.
    /**
     * Transfers the given amount of investment with the given id from the given from user to the given to user.
     *
     * @throws Error if the investment was not found or is not owned by `to`.
     */
    transferInvestment(
        id: string, from: IPersistedInvestor, to: IPersistedInvestor,
        amount: number, date: number): Promise<number>;
    /**
     * Saves the given investment to the database.
     */
    saveInvestment(investment: IPersistedInvestment): Promise<void>;
}

/**
 * `SqlInvestmentDao` is a specific implementation of `IInvestmentDao` for interfacing with MySQL using TypeORM.
 */
@singleton()
export class SqlInvestmentDao implements IInvestmentDao {


    /**
     * @inheritdoc
     */
    public async getInvestments(userId?: string): Promise<IPersistedInvestment[]> {
        return getRepository(PersistedInvestment).find({
            relations: ['contract', 'owner'],
        }).then((investments) =>
            investments.filter((investment) => !userId || investment.owner.id === userId));
    }


    /**
     * @inheritdoc
     */
    public async getInvestment(id: string): Promise<IPersistedInvestment | null> {
        return getRepository(PersistedInvestment).findOne(id, {
            relations: ['contract', 'owner'],
        }).then((investment) => investment ? investment : null);
    }


    /**
     * @inheritdoc
     */
    public async createInvestment(investment: IStorableInvestment, date: number): Promise<IPersistedInvestment> {
        const daos = await getDaos();
        const investorDao = new daos.SqlInvestorDao();
        const contractDao = new daos.SqlContractDao();
        const toSave = new PersistedInvestment();
        const contract = await contractDao.getContract(investment.contractId);
        if (!contract) {
            throw new DaoError('Contract not found');
        }
        toSave.contract = contract;
        toSave.amount = investment.amount;
        toSave.purchaseDate = date;
        const investor = await investorDao.getOne(investment.ownerId);
        if (!investor) {
            throw new DaoError('Investor not found');
        }
        toSave.owner = investor;
        await getRepository(PersistedInvestment).insert(toSave);
        return toSave;
    }


    /**
     * @inheritdoc
     */
    public async deleteInvestment(id: string): Promise<void> {
        const result = await getRepository(PersistedInvestment).delete(id);
        assert(result.affected === 1, `Did not delete investment row with ID ${id}`);
    }


    /**
     * @inheritdoc
     */
    public async transferInvestment(
        id: string, from: IPersistedInvestor, to: IPersistedInvestor, amount: number, date: number): Promise<number> {
        const investment = await this.getInvestment(id);
        if (!investment) {
            throw new DaoError('Not found');
        }
        if (investment.owner.id !== from.id) {
            throw new DaoError(`Investment ${investment.id} is not owned by
            ${from.id} but instead by ${investment.owner.id}`);
        }
        const contract = investment.contract;
        investment.sellDate = date;
        const amountToTake = investment.amount * amount / investment.value(date);
        await this.createInvestment(
            new StorableInvestment(contract.id, amountToTake, to.id), date);
        if (investment.value(date) - amount > 0) {
            await this.createInvestment(
                new StorableInvestment(contract.id, investment.amount - amountToTake, from.id), date);
        }
        await this.saveInvestment(investment);
        return amountToTake;
    }


    /**
     * @inheritdoc
     */
    public async saveInvestment(investment: IPersistedInvestment): Promise<void> {
        const result = await getRepository(PersistedInvestment)
            .update(investment.id, investment as PersistedInvestment);
        assert(result.raw.affectedRows === 1, `Did not update contract with ID ${investment.id}`);
        return;
    }
}
