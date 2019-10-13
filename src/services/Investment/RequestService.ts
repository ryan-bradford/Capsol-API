import { IRequestDao } from 'src/daos/investment/RequestDao';
import { IUserDao, IInvestmentDao, IContractDao } from '@daos';
import { logger } from '@shared';
import {
    IPersistedRequest, IStorableRequest, IPersistedInvestor, IStoredInvestor,
    IPersistedHomeowner, IStoredHomeowner, IPersistedUser, isInvestor,
    StorableInvestment, StorableRequest, isHomeowner, IPersistedContract, IPersistedInvestment,
} from '@entities';

export interface IRequestService {

    createPurchaseRequest(userId: number, amount: number): Promise<void>;
    createSellRequest(amount: number, userId: number): Promise<void>;
    handleRequests(): Promise<void>;

}

export class RequestService implements IRequestService {


    constructor(
        private requestDao: IRequestDao<IPersistedRequest, IStorableRequest>,
        private investorDao: IUserDao<IPersistedInvestor, IStoredInvestor>,
        private homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
        private investmentDao: IInvestmentDao,
        private contractDao: IContractDao) { }


    public async createPurchaseRequest(userId: number, amount: number): Promise<void> {
        const investor = await this.investorDao.getOne(userId);
        if (!investor) {
            throw new Error('Not Found');
        }
        const newRequest = new StorableRequest(amount, new Date(), investor.id, 'purchase');
        await this.requestDao.createRequest(newRequest);
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
        const newRequest = new StorableRequest(amount, new Date(), user.id, 'sell');
        await this.requestDao.createRequest(newRequest);
        await this.handleRequests();
        return;
    }


    public async handleRequests(): Promise<void> {
        // Matches purchase requests to sell requests based on age
        // When a match is made, looks into sellers portfolio and determines what to transfer
        const requests =
            await this.requestDao.getRequests();
        const allPurchaseRequests = requests.filter((request) => request.type === 'purchase');
        const allSellRequests = requests.filter((request) => request.type === 'sell');
        allPurchaseRequests.sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());
        allSellRequests.sort((a, b) => b.amount - a.amount);
        const allContracts = (await this.contractDao.getContracts())
            .filter((contract) => !contract.isFulfilled)
            .sort((a, b) => b.unsoldAmount / b.saleAmount - a.unsoldAmount / a.saleAmount);
        let currentPurchase = allPurchaseRequests.pop();
        let currentSell: (IPersistedRequest | IPersistedContract | undefined) = allSellRequests.pop();
        if (!currentSell) {
            currentSell = allContracts.pop();
        }
        while (currentPurchase && currentSell) {
            if (isRequest(currentSell)) {
                await this.takeAssets(Math.min(currentSell.amount, currentPurchase.amount),
                    currentSell.investor, currentPurchase.investor as IPersistedInvestor);
                const initPurchaseAmount = currentPurchase.amount;
                currentPurchase.amount -= currentSell.amount;
                currentPurchase.amount = Math.max(currentPurchase.amount, 0);
                currentSell.amount -= initPurchaseAmount;
                currentSell.amount = Math.max((currentSell as IPersistedRequest).amount, 0);
                await this.requestDao.saveRequest(currentSell);
                if (currentSell.amount === 0) {
                    await this.requestDao.deleteRequest(currentSell.id);
                    currentSell = allSellRequests.pop() || allContracts.pop();
                }
            } else {
                const investment = await this.takeAssets(Math.min(currentSell.unsoldAmount, currentPurchase.amount),
                    currentSell.homeowner, currentPurchase.investor as IPersistedInvestor);
                if (!investment) {
                    throw new Error('Bad');
                }
                currentPurchase.amount -= currentSell.unsoldAmount;
                currentPurchase.amount = Math.max(currentPurchase.amount, 0);
                currentSell.investments.push(investment);
                if (currentSell.isFulfilled) {
                    await this.requestDao.deleteRequest(currentSell.id);
                    currentSell = allSellRequests.pop() || allContracts.pop();
                }
            }
            await this.requestDao.saveRequest(currentPurchase);
            if (currentPurchase.amount === 0) {
                await this.requestDao.deleteRequest(currentPurchase.id);
                currentPurchase = allPurchaseRequests.pop();
            }
        }
    }


    private async takeAssets(amount: number, from: IPersistedUser, to: IPersistedInvestor):
        (Promise<IPersistedInvestment | void>) {
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
        } else if (isHomeowner(from)) {
            from = (from as IPersistedHomeowner);
            if (!from.id) {
                throw new Error('bad user');
            }
            const contracts = await this.contractDao.getContracts(from.id);
            if (contracts.length !== 1) {
                throw new Error(`Bad ${contracts.length} ${from.id}`);
            }
            const contract = contracts[0];
            const toCreate = new StorableInvestment(contract.id, amount / contract.saleAmount, to.id);
            const newInvestment = await this.investmentDao.createInvestment(toCreate);
            contract.investments.push(newInvestment);
            return newInvestment;
        }
    }


}

function isRequest(a: any): a is IPersistedRequest {
    return a.type === 'purchase' || a.type === 'sell';
}
