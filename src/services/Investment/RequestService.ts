import { IRequestDao } from 'src/daos/investment/RequestDao';
import { IUserDao, IInvestmentDao, IContractDao } from '@daos';
import {
    IPersistedSellRequest, IPersistedPurchaseRequest, IPersistedInvestor, IStoredInvestor,
    IPersistedHomeowner, IStoredHomeowner, StorablePurchaseRequest, IStorableSellRequest,
    IStorablePurchaseRequest, StorableSellRequest, IPersistedUser, isInvestor, StorableInvestment,
} from '@entities';
import { logger } from '@shared';

export interface IRequestService {

    createPurchaseRequest(userId: number, amount: number): Promise<void>;
    createSellRequest(amount: number, userId: number): Promise<void>;

}

export class RequestService implements IRequestService {


    constructor(
        private sellRequestDao: IRequestDao<IPersistedSellRequest, IStorableSellRequest>,
        private purchaseRequestDao: IRequestDao<IPersistedPurchaseRequest, IStorablePurchaseRequest>,
        private investorDao: IUserDao<IPersistedInvestor, IStoredInvestor>,
        private homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
        private investmentDao: IInvestmentDao,
        private contractDao: IContractDao) { }


    public async createPurchaseRequest(userId: number, amount: number): Promise<void> {
        const investor = await this.investorDao.getOne(userId);
        if (!investor) {
            throw new Error('Not Found');
        }
        const newRequest = new StorablePurchaseRequest(amount, new Date(), investor.id);
        await this.purchaseRequestDao.createRequest(newRequest);
        await this.handleRequests();
        return;
    }


    public async createSellRequest(userId: number, amount: number): Promise<void> {
        // Literally only creates a sell request with the user ID and amount
        const investor = await this.investorDao.getOne(userId);
        const homeowner = await this.homeownerDao.getOne(userId);
        const user = investor ? investor : homeowner;
        if (!user) {
            throw new Error('Not Found');
        }
        const newRequest = new StorableSellRequest(amount, new Date(), user.id);
        await this.sellRequestDao.createRequest(newRequest);
        await this.handleRequests();
        return;
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
                await this.takeAssets(currentSell.amount, currentSell.user,
                    currentPurchase.user as IPersistedInvestor);
                currentPurchase.amount -= currentSell.amount;
                currentSell.amount = 0;
                await this.sellRequestDao.deleteRequest(currentSell.id);
                await this.purchaseRequestDao.saveRequest(currentPurchase);
                currentSell = allSellRequests.pop();
            } else if (currentPurchase.amount === currentSell.amount) {
                // Transfer sell request to purchaser and delete both.
                await this.takeAssets(currentPurchase.amount, currentSell.user,
                    currentPurchase.user as IPersistedInvestor);
                currentPurchase.amount = 0;
                currentSell.amount = 0;
                await this.sellRequestDao.deleteRequest(currentSell.id);
                await this.purchaseRequestDao.deleteRequest(currentPurchase.id);
                currentPurchase = allPurchaseRequests.pop();
                currentSell = allSellRequests.pop();
            } else if (currentPurchase.amount < currentSell.amount) {
                // Split sell request and delete purchase request
                await this.takeAssets(currentPurchase.amount, currentSell.user,
                    currentPurchase.user as IPersistedInvestor);
                currentSell.amount -= currentPurchase.amount;
                currentPurchase.amount = 0;
                await this.sellRequestDao.saveRequest(currentSell);
                await this.purchaseRequestDao.deleteRequest(currentPurchase.id);
                currentPurchase = allPurchaseRequests.pop();
            }
        }
    }


    private async takeAssets(amount: number, from: IPersistedUser, to: IPersistedInvestor): Promise<void> {
        if (isInvestor(from)) {
            const investments = await this.investmentDao.getInvestments(from.id);
            while (amount > 0) {
                const curInvestment = investments.pop();
                if (!curInvestment) {
                    logger.error(String(amount));
                    throw new Error('SEVERE');
                }
                if (curInvestment.value > amount) {
                    const percentPurchase = amount / curInvestment.value;
                    const toUpdateInvestmentPercentage = curInvestment.percentage * percentPurchase;
                    const toCreateInvestmentPercentage =
                        curInvestment.percentage - curInvestment.percentage * percentPurchase;
                    const contract = curInvestment.contract;
                    await this.investmentDao.deleteInvestment(curInvestment.id);
                    await this.investmentDao.createInvestment(
                        new StorableInvestment(contract.id, toUpdateInvestmentPercentage, to.id));
                    await this.investmentDao.createInvestment(
                        new StorableInvestment(contract.id, toCreateInvestmentPercentage, from.id));
                    amount = 0;
                } else {
                    amount -= curInvestment.value;
                    await this.investmentDao.transferInvestment(curInvestment.id, from as IPersistedInvestor, to);
                }
            }
        } else {
            if (!from.id) {
                throw new Error('bad user');
            }
            logger.info(String(from.id));
            const contracts = await this.contractDao.getContracts(from.id);
            if (contracts.length !== 1) {
                throw new Error('Bad');
            }
            const contract = contracts[0];
            const toCreate = new StorableInvestment(contract.id, amount / contract.saleAmount, to.id);
            const newInvestment = await this.investmentDao.createInvestment(toCreate);
            contract.investments.push(newInvestment);
        }
    }


}
