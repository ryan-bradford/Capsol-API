import { getRepository } from 'typeorm';
import { IUserDao } from '@daos';
import {
    IPersistedRequest, IStorableRequest, PersistedRequest,
    IPersistedInvestor, IStorableInvestor,
} from '@entities';
import { singleton, inject } from 'tsyringe';
import { SqlInvestorDao } from '../user/InvestorDao';
import { strict as assert } from 'assert';

/**
 * `IRequestDao` is a database interface for dealing with requests.
 */
export interface IRequestDao {

    /**
     * Returns all requests in the database.
     */
    getRequests(): Promise<IPersistedRequest[]>;
    /**
     * Creates a request with the given information.
     */
    createRequest(toCreate: IStorableRequest): Promise<IPersistedRequest>;
    /**
     * Deletes the request with the given ID.
     *
     * @throws Error if the request didn't exist.
     */
    deleteRequest(toDeleteId: string): Promise<void>;
    /**
     * Saves the given request.
     *
     * @throws Error if the request didn't exist.
     */
    saveRequest(toSave: IPersistedRequest): Promise<void>;

}

/**
 * `SqlRequestDao` is a specific implementation of `IRequestDao` for interfacing with MySQL using TypeORM.
 */
@singleton()
export class SqlRequestDao implements IRequestDao {


    constructor(@inject('InvestorDao') private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>) { }


    /**
     * @inheritdoc
     */
    public getRequests(): Promise<IPersistedRequest[]> {
        return getRepository(PersistedRequest).find({
            relations: ['investor'],
        });
    }


    /**
     * @inheritdoc
     */
    public async createRequest(toCreate: IStorableRequest): Promise<IPersistedRequest> {
        const persistedRequest = new PersistedRequest();
        persistedRequest.amount = toCreate.amount;
        persistedRequest.dateCreated = toCreate.dateCreated;
        persistedRequest.type = toCreate.type;
        const investor = await (this.investorDao as SqlInvestorDao).getOne(toCreate.userId, false);
        persistedRequest.investor = investor as IPersistedInvestor;
        await getRepository(PersistedRequest).insert(persistedRequest);
        return persistedRequest;
    }


    /**
     * @inheritdoc
     */
    public async deleteRequest(toDeleteId: string): Promise<void> {
        const result = await getRepository(PersistedRequest).delete(toDeleteId);
        assert(result.affected === 1, `Did not delete request row with ID ${toDeleteId}`);
        return;
    }


    /**
     * @inheritdoc
     */
    public async saveRequest(toSave: IPersistedRequest): Promise<void> {
        const result = await getRepository(PersistedRequest).update({ id: toSave.id }, {
            amount: toSave.amount,
        });
        assert(result.raw.affectedRows, `Did not save request row with ID ${toSave.id}`);
        return;
    }
}
