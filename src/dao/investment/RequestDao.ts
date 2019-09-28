import {
    PurchaseRequest, IRequest, IPurchaseRequest,
    ISellRequest, SellRequest,
} from 'src/entities/investment/Request';

export interface IRequestDao<T extends IRequest> {

    getRequests(): Promise<T[]>;
    createRequest(toCreate: T): Promise<void>;
    deleteRequest(toDelete: T): Promise<void>;

}

export class SqlPurchaseRequestDao implements IRequestDao<IPurchaseRequest> {


    public getRequests(): Promise<IPurchaseRequest[]> {
        return PurchaseRequest.find();
    }


    public createRequest(toCreate: IPurchaseRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }


    public async deleteRequest(toDelete: IPurchaseRequest): Promise<void> {
        // tslint:disable-next-line: no-empty
        await PurchaseRequest.delete(toDelete.id);
    }
}


// tslint:disable-next-line: max-classes-per-file
export class SqlSellRequestDao implements IRequestDao<ISellRequest> {


    public getRequests(): Promise<ISellRequest[]> {
        return SellRequest.find();
    }


    public createRequest(toCreate: IPurchaseRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }


    public async deleteRequest(toDelete: ISellRequest): Promise<void> {
        // tslint:disable-next-line: no-empty
        await SellRequest.delete(toDelete.id);
    }
}
