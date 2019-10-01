import { PurchaseRequest, ISellRequest, IPurchaseRequest, SellRequest } from 'src/entities/investment/Request';
import { UserRoles, Investor, Homeowner, IUser, Contract, Investment, IInvestor, IInvestment, IHomeowner } from '@entities';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { IUserDao, IInvestmentDao, IContractDao } from '@daos';
import { getRandomInt } from '@shared';

export interface IRequestService {

    createPurchaseRequest(userId: number, amount: number): Promise<void>;
    createSellRequest(amount: number, userId: number): Promise<void>;

}

export class RequestService implements IRequestService {


    constructor(
        private sellRequestDao: IRequestDao<ISellRequest>,
        private purchaseRequestDao: IRequestDao<IPurchaseRequest>,
        private investorDao: IUserDao<IInvestor>,
        private homeownerDao: IUserDao<IHomeowner>,
        private investmentDao: IInvestmentDao,
        private contractDao: IContractDao) { }


    public async createPurchaseRequest(userId: number, amount: number): Promise<void> {
        const investor = await this.investorDao.getOne(userId);
        if (!investor) {
            throw new Error('Not Found');
        }
        const newRequest = new PurchaseRequest();
        newRequest.amount = amount;
        newRequest.user = investor;
        newRequest.dateCreated = new Date();
        newRequest.id = getRandomInt();
        this.purchaseRequestDao.createRequest(newRequest);
        this.handleRequests();
    }


    public async createSellRequest(userId: number, amount: number): Promise<void> {
        // Literally only creates a sell request with the user ID and amount
        const investor = await this.investorDao.getOne(userId);
        const homeowner = await this.homeownerDao.getOne(userId);
        const user = investor ? investor : homeowner;
        if (!user) {
            throw new Error('Not Found');
        }
        const newRequest = new SellRequest();
        newRequest.amount = amount;
        newRequest.user = user;
        newRequest.dateCreated = new Date();
        newRequest.id = getRandomInt();
        this.sellRequestDao.createRequest(newRequest);
        this.handleRequests();
    }


    private async handleRequests(): Promise<void> {
        // Matches purchase requests to sell requests based on age
        // When a match is made, looks into sellers portfolio and determines what to transfer
        const [allPurchaseRequests, allSellRequests] =
            await Promise.all([this.purchaseRequestDao.getRequests(), this.sellRequestDao.getRequests()]);
        allPurchaseRequests.sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());
        allSellRequests.sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());
        let currentPurchase = allPurchaseRequests.pop();
        let currentSell = allSellRequests.pop();
        while (currentPurchase && currentSell) {
            if (currentPurchase.amount > currentSell.amount) {
                // Transfer this sell request to the purchaser and split purchase request.
                currentPurchase.amount -= currentSell.amount;
                currentSell.amount = 0;
                await this.takeAssets(currentSell.amount, currentSell.user, currentPurchase.user as IInvestor);
                this.sellRequestDao.deleteRequest(currentSell);
                currentSell = allSellRequests.pop();
            } else if (currentPurchase.amount === currentSell.amount) {
                // Transfer sell request to purchaser and delete both.
                currentPurchase.amount = 0;
                currentSell.amount = 0;
                await this.takeAssets(currentPurchase.amount, currentSell.user, currentPurchase.user as IInvestor);
                this.sellRequestDao.deleteRequest(currentSell);
                this.purchaseRequestDao.deleteRequest(currentPurchase);
                currentPurchase = allPurchaseRequests.pop();
                currentSell = allSellRequests.pop();
            } else if (currentPurchase.amount < currentSell.amount) {
                // Split sell request and delete purchase request
                currentSell.amount -= currentPurchase.amount;
                currentPurchase.amount = 0;
                await this.takeAssets(currentPurchase.amount, currentSell.user, currentPurchase.user as IInvestor);
                this.purchaseRequestDao.deleteRequest(currentPurchase);
                currentPurchase = allPurchaseRequests.pop();
            }
        }
    }


    private async takeAssets(amount: number, from: IUser, to: IInvestor): Promise<void> {
        if (from.role === UserRoles.Homeowner) {
            if (!from.id) {
                throw new Error('bad user');
            }
            const contract = await this.contractDao.getContract(from.id);
            const newInvestment = new Investment();
            newInvestment.contract = contract;
            newInvestment.forSale = false;
            newInvestment.id = getRandomInt();
            newInvestment.owner = to;
            newInvestment.percentage = amount / contract.saleAmount;
            this.investmentDao.createInvestment(newInvestment);
            contract.investments.push(newInvestment);
        } else {
            // Find investments.
        }
    }


    private async splitInvestment(investment: IInvestment) {
        throw new Error('Not impl');
    }
}
