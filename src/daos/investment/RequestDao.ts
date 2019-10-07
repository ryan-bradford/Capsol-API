import { getRepository } from 'typeorm';
import {
    IPersistedRequest, IPersistedPurchaseRequest,
    PersistedPurchaseRequest, IPersistedSellRequest,
    PersistedSellRequest, IStorableRequest, IStorablePurchaseRequest,
    IStorableSellRequest, IPersistedHomeowner, IPersistedInvestor,
} from '@entities';
import { getRandomInt } from '@shared';
import { getDaos } from '@daos';

export interface IRequestDao<T extends IPersistedRequest, R extends IStorableRequest> {

    getRequests(): Promise<T[]>;
    createRequest(toCreate: R): Promise<T>;
    deleteRequest(toDeleteId: number): Promise<void>;

}

export class SqlPurchaseRequestDao implements IRequestDao<IPersistedPurchaseRequest, IStorablePurchaseRequest> {


    public getRequests(): Promise<IPersistedPurchaseRequest[]> {
        return getRepository(PersistedPurchaseRequest).find();
    }


    public async createRequest(toCreate: IStorablePurchaseRequest): Promise<IPersistedPurchaseRequest> {
        const daos = await getDaos();
        const persistedRequest = new PersistedPurchaseRequest();
        persistedRequest.amount = toCreate.amount;
        persistedRequest.dateCreated = toCreate.dateCreated;
        persistedRequest.id = getRandomInt();
        const investor = await new daos.SqlInvestorDao().getOne(toCreate.userId);
        const homeowner = await new daos.SqlHomeownerDao().getOne(toCreate.userId);
        if (investor) {
            persistedRequest.investor = investor as IPersistedInvestor;
        } else {
            persistedRequest.homeowner = homeowner as IPersistedHomeowner;
        }
        getRepository(PersistedPurchaseRequest).save(persistedRequest);
        return persistedRequest;
    }


    public async deleteRequest(toDeleteId: number): Promise<void> {
        await getRepository(PersistedPurchaseRequest).delete(toDeleteId);
        return;
    }
}


// tslint:disable-next-line: max-classes-per-file
export class SqlSellRequestDao implements IRequestDao<IPersistedSellRequest, IStorableSellRequest> {


    public getRequests(): Promise<IPersistedSellRequest[]> {
        return getRepository(PersistedSellRequest).find();
    }


    public async createRequest(toCreate: IStorableSellRequest): Promise<IPersistedSellRequest> {
        const daos = await getDaos();
        const persistedRequest = new PersistedSellRequest();
        persistedRequest.amount = toCreate.amount;
        persistedRequest.dateCreated = toCreate.dateCreated;
        persistedRequest.id = getRandomInt();
        const investor = await new daos.SqlInvestorDao().getOne(toCreate.userId);
        const homeowner = await new daos.SqlHomeownerDao().getOne(toCreate.userId);
        if (investor) {
            persistedRequest.investor = investor as IPersistedInvestor;
        } else {
            persistedRequest.homeowner = homeowner as IPersistedHomeowner;
        }
        getRepository(PersistedSellRequest).save(persistedRequest);
        return persistedRequest;
    }


    public async deleteRequest(toDeleteId: number): Promise<void> {
        await getRepository(PersistedSellRequest).delete(toDeleteId);
        return;
    }
}
