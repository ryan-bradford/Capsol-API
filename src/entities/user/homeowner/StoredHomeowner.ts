import { IStoredUser, IStoredContract, StoredUser, IStoredPurchaseRequest } from '@entities';

export interface IStoredHomeowner extends IStoredUser {
    contract?: IStoredContract;
}

export class StoredHomeowner extends StoredUser implements IStoredHomeowner {

    public contract?: IStoredContract;


    constructor(id: number, name: string, email: string, pwdHash: string,
        // tslint:disable-next-line: align
        purchaseRequests: IStoredPurchaseRequest[], contract?: IStoredContract) {
        super(id, name, email, pwdHash, purchaseRequests);
        this.contract = contract;
    }

}
