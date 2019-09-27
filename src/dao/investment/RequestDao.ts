import { PurchaseRequest } from 'src/entities/investment/PurchaseRequest';

export interface IRequestDao {

    getPurchaseReqests(): Promise<PurchaseRequest>;

}

export class SqlRequestDao implements IRequestDao {


    getPurchaseReqests(): Promise<PurchaseRequest> {
        throw new Error("Method not implemented.");
    }

}