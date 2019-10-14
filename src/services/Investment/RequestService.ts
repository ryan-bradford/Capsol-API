import { IRequestDao } from 'src/daos/investment/RequestDao';
import { IUserDao, IInvestmentDao, IContractDao } from '@daos';
import { logger } from '@shared';
import {
    IPersistedRequest, IStorableRequest, IPersistedInvestor, IStoredInvestor,
    IPersistedHomeowner, IStoredHomeowner, IPersistedUser, isInvestor,
    StorableInvestment, StorableRequest, isHomeowner, IPersistedContract, IPersistedInvestment,
} from '@entities';
import { assert } from 'console';

export interface IRequestService {

    createPurchaseRequest(user: IPersistedInvestor, amount: number): Promise<void>;
    createSellRequest(user: IPersistedInvestor, amount: number): Promise<void>;
    handleRequests(): Promise<void>;

}

export class RequestService implements IRequestService {


    constructor(
        private requestDao: IRequestDao,
        private investmentDao: IInvestmentDao,
        private contractDao: IContractDao) { }


    public async createPurchaseRequest(user: IPersistedInvestor, amount: number): Promise<void> {
        const newRequest = new StorableRequest(amount, new Date(), user.id, 'purchase');
        await this.requestDao.createRequest(newRequest);
        await this.handleRequests();
        return;
    }


    public async createSellRequest(user: IPersistedInvestor, amount: number): Promise<void> {
        // Literally only creates a sell request with the user ID and amount
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
        assert(allPurchaseRequests.length - 1 <= 0 || allSellRequests.length + allContracts.length - 1 <= 0,
            `${allPurchaseRequests.length}, ${allSellRequests.length + allContracts.length}`);
        let currentPurchase = allPurchaseRequests.pop();
        let currentSell: (IPersistedRequest | IPersistedContract | undefined) =
            allSellRequests.pop() || allContracts.pop();
        while (currentPurchase && currentSell) {
            if (isRequest(currentSell)) {
                const transactionAmount = Math.min(currentSell.amount, currentPurchase.amount);
                await this.takeAssets(transactionAmount,
                    currentSell.investor, currentPurchase.investor as IPersistedInvestor);
                currentPurchase.amount -= transactionAmount;
                currentSell.amount -= transactionAmount;
                await this.requestDao.saveRequest(currentSell);
                if (currentSell.amount === 0) {
                    await this.requestDao.deleteRequest(currentSell.id);
                    currentSell = allSellRequests.pop() || allContracts.pop();
                }
            } else {
                const transactionAmount = Math.min(currentSell.unsoldAmount, currentPurchase.amount);
                const investment = await this.takeAssets(transactionAmount,
                    currentSell.homeowner, currentPurchase.investor as IPersistedInvestor);
                if (!investment) {
                    throw new Error('Bad');
                }
                currentPurchase.amount -= transactionAmount;
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
        await this.mergeInvestments();
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
                    const contract = curInvestment.contract;
                    await this.investmentDao.deleteInvestment(curInvestment.id);
                    await this.investmentDao.createInvestment(
                        new StorableInvestment(contract.id, amount, to.id));
                    await this.investmentDao.createInvestment(
                        new StorableInvestment(contract.id, curInvestment.value - amount, from.id));
                    amount = 0;
                } else {
                    amount -= curInvestment.value;
                    await this.investmentDao.transferInvestment(curInvestment.id, from as IPersistedInvestor, to);
                }
            }
        } else if (isHomeowner(from)) {
            logger.info(JSON.stringify(from));
            from = (from as IPersistedHomeowner);
            if (!from.id) {
                throw new Error('bad user');
            }
            const contracts = await this.contractDao.getContracts(from.id);
            if (contracts.length !== 1) {
                throw new Error(`Bad ${contracts.length} ${from.id}`);
            }
            const contract = contracts[0];
            const toCreate = new StorableInvestment(contract.id, amount, to.id);
            const newInvestment = await this.investmentDao.createInvestment(toCreate);
            contract.investments.push(newInvestment);
            return newInvestment;
        }
    }


    private async mergeInvestments(): Promise<void> {
        const investments = await this.investmentDao.getInvestments();
        const investorContractToInvestment: Map<[number, number], IPersistedInvestment> = new Map();
        await Promise.all(investments.map(async (investment) => {
            const key: [number, number] = [investment.contract.id, investment.owner.id];
            const current = investorContractToInvestment.get(key);
            if (!current) {
                investorContractToInvestment.set(key, investment);
                return;
            } else {
                current.percentage += investment.percentage;
                await this.investmentDao.deleteInvestment(investment.id);
                await this.investmentDao.saveInvestment(current);
                return;
            }
        }));
        return;
    }
}

function isRequest(a: any): a is IPersistedRequest {
    return a.type === 'purchase' || a.type === 'sell';
}
