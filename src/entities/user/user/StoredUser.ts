import { IStoredPurchaseRequest } from '@entities';

export interface IStoredUser {
    id: number;
    name: string;
    email: string;
    pwdHash: string;
    purchaseRequests: IStoredPurchaseRequest[];
}

export abstract class StoredUser implements IStoredUser {

    public id: number;
    public name: string;
    public email: string;
    public pwdHash: string;
    public purchaseRequests: IStoredPurchaseRequest[];


    constructor(id: number, name: string, email: string, pwdHash: string, purchaseRequests: IStoredPurchaseRequest[]) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.pwdHash = pwdHash;
        this.purchaseRequests = purchaseRequests;
    }
}
