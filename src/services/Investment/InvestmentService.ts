import {
    IPersistedInvestment, StorablePurchaseRequest, IPersistedPurchaseRequest,
    IStorablePurchaseRequest, IPersistedSellRequest, IStorableSellRequest, StorableSellRequest,
} from '@entities';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { IRequestService, RequestService } from '@services';

export interface IInvestmentService {
    addFunds(userId: number, amount: number): Promise<IPersistedInvestment[]>;
    sellInvestments(userId: number, amount: number): Promise<void>;
}

export class InvestmentService implements IInvestmentService {


    constructor(
        private purchaseRequestDao: IRequestDao<IPersistedPurchaseRequest, IStorablePurchaseRequest>,
        private sellRequestDao: IRequestDao<IPersistedSellRequest, IStorableSellRequest>,
        private requestService: IRequestService) { }


    public async addFunds(userId: number, amount: number): Promise<IPersistedInvestment[]> {
        await this.requestService.createPurchaseRequest(userId, amount);
        return [];
    }


    public async sellInvestments(userId: number, amount: number): Promise<void> {
        await this.requestService.createSellRequest(userId, amount);
        return;
    }
}
