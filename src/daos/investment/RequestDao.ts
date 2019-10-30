import { getRepository } from 'typeorm';
import { getDaos } from '@daos';
import { IPersistedRequest, IStorableRequest, PersistedRequest, IPersistedInvestor } from '@entities';
import { singleton } from 'tsyringe';
import { logger } from '@shared';

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
        const daos = await getDaos();
        const persistedRequest = new PersistedRequest();
        persistedRequest.amount = toCreate.amount;
        persistedRequest.dateCreated = toCreate.dateCreated;
        persistedRequest.type = toCreate.type;
        const investor = await new daos.SqlInvestorDao().getOne(toCreate.userId, false);
        persistedRequest.investor = investor as IPersistedInvestor;
        const toReturn = await getRepository(PersistedRequest).save(persistedRequest);
        return toReturn;
    }


    /**
     * @inheritdoc
     */
    public async deleteRequest(toDeleteId: string): Promise<void> {
        const result = await getRepository(PersistedRequest).delete(toDeleteId);
        if (result.affected === 0) {
            throw new Error('Not found!');
        }
        return;
    }


    /**
     * @inheritdoc
     */
    public async saveRequest(toSave: IPersistedRequest): Promise<void> {
        const result = await getRepository(PersistedRequest).update(toSave.id, {
            amount: toSave.amount,
        });
        if (result.affected === 0) {
            throw new Error('Not found!');
        }
        return;
    }
}
