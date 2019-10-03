import { getRepository } from 'typeorm';
import {
    IPersistedRequest, IStoredRequest, IPersistedPurchaseRequest,
    IStoredPurchaseRequest, PersistedPurchaseRequest, IPersistedSellRequest,
    IStoredSellRequest, PersistedSellRequest, IStorableRequest, IStorablePurchaseRequest, IStorableSellRequest,
} from '@entities';

export interface IRequestDao<T extends IPersistedRequest, R extends IStorableRequest> {

    getRequests(): Promise<T[]>;
    createRequest(toCreate: R): Promise<void>;
    deleteRequest(toDelete: T): Promise<void>;

}

export class SqlPurchaseRequestDao implements IRequestDao<IPersistedPurchaseRequest, IStorablePurchaseRequest> {


    public getRequests(): Promise<IPersistedPurchaseRequest[]> {
        return getRepository(PersistedPurchaseRequest).find();
    }


    public createRequest(toCreate: IStorablePurchaseRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }


    public async deleteRequest(toDelete: IPersistedPurchaseRequest): Promise<void> {
        // tslint:disable-next-line: no-empty
        await getRepository(PersistedPurchaseRequest).delete(toDelete.id);
    }
}


// tslint:disable-next-line: max-classes-per-file
export class SqlSellRequestDao implements IRequestDao<IPersistedSellRequest, IStorableSellRequest> {


    public getRequests(): Promise<IPersistedSellRequest[]> {
        return getRepository(PersistedSellRequest).find();
    }


    public createRequest(toCreate: IStorableSellRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }


    public async deleteRequest(toDelete: IPersistedSellRequest): Promise<void> {
        // tslint:disable-next-line: no-empty
        await getRepository(PersistedSellRequest).delete(toDelete.id);
    }
}
