import { getRepository } from 'typeorm';
import { getRandomInt, logger } from '@shared';
import { getDaos } from '@daos';
import { IPersistedRequest, IStorableRequest, PersistedRequest, IPersistedInvestor } from '@entities';

export interface IRequestDao {

    getRequests(): Promise<IPersistedRequest[]>;
    createRequest(toCreate: IStorableRequest): Promise<IPersistedRequest>;
    deleteRequest(toDeleteId: number): Promise<void>;
    saveRequest(toSave: IPersistedRequest): Promise<void>;

}

export class SqlRequestDao implements IRequestDao {


    public getRequests(): Promise<IPersistedRequest[]> {
        return getRepository(PersistedRequest).find({
            relations: ['investor'],
        });
    }


    public async createRequest(toCreate: IStorableRequest): Promise<IPersistedRequest> {
        const daos = await getDaos();
        const persistedRequest = new PersistedRequest();
        persistedRequest.amount = toCreate.amount;
        persistedRequest.dateCreated = toCreate.dateCreated;
        persistedRequest.type = toCreate.type;
        persistedRequest.id = getRandomInt();
        const investor = await new daos.SqlInvestorDao().getOne(toCreate.userId, false);
        persistedRequest.investor = investor as IPersistedInvestor;
        await getRepository(PersistedRequest).save(persistedRequest);
        return persistedRequest;
    }


    public async deleteRequest(toDeleteId: number): Promise<void> {
        await getRepository(PersistedRequest).delete(toDeleteId);
        return;
    }


    public async saveRequest(toSave: IPersistedRequest): Promise<void> {
        await getRepository(PersistedRequest).save(toSave);
        return;
    }
}
