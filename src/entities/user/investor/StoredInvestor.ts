import { IStoredUser, IStoredInvestment, IStoredSellRequest, StoredUser, IStoredPurchaseRequest } from '@entities';

export interface IStoredInvestor extends IStoredUser {
    investments: IStoredInvestment[];
    sellRequests: IStoredSellRequest[];
}

export class StoredInvestor extends StoredUser implements IStoredInvestor {

    public investments: IStoredInvestment[];
    public sellRequests: IStoredSellRequest[];


    constructor(id: number, name: string, email: string, pwdHash: string,
        // tslint:disable-next-line: align
        purchaseRequests: IStoredPurchaseRequest[], investments: IStoredInvestment[],
        // tslint:disable-next-line: align
        sellRequests: IStoredSellRequest[]) {
        super(id, name, email, pwdHash, purchaseRequests);
        this.investments = investments;
        this.sellRequests = sellRequests;
    }

}
