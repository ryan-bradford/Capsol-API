import { IRequestDao } from 'src/daos/investment/RequestDao';
import { IInvestmentDao, IContractDao } from '@daos';
import { getDateAsNumber } from '@shared';
import {
    IPersistedRequest, IPersistedInvestor,
    IPersistedHomeowner, IPersistedUser, isInvestor,
    StorableInvestment, StorableRequest, isHomeowner, IPersistedContract, IPersistedInvestment, PersistedCashDeposit,
} from '@entities';
import { strict as assert } from 'assert';
import { injectable, inject } from 'tsyringe';
import { ICashDepositDao } from 'src/daos/investment/CashDepositDao';

/**
 * All the actions that are needed for business operations on requests.
 */
export interface IRequestService {
    /**
     * Pairs purchase with sell requests first, and then contracts.
     * When a pairing is made, if the sell request is a contract, adds a new investment to the contract.
     * If the sell request is by an investor, transfers investments from the investor to the purchaser.
     * Saves a record that the investment was once owned by the sell investor.
     * After that all is done, merges investments within the table to be more simple.
     *
     * @throws Error if the selling investor does not own enough investments to satisfy the sell request.
     */
    handleRequests(): Promise<void>;

}

@injectable()
export class RequestService implements IRequestService {


    constructor(
        @inject('RequestDao') private requestDao: IRequestDao,
        @inject('InvestmentDao') private investmentDao: IInvestmentDao,
        @inject('ContractDao') private contractDao: IContractDao,
        @inject('CashDepositDao') private cashDepositDao: ICashDepositDao) { }


    public async handleRequests(): Promise<void> {
        // Matches purchase requests to sell requests based on age
        // When a match is made, looks into sellers portfolio and determines what to transfer
        const requests =
            await this.requestDao.getRequests();
        let allPurchaseRequests = requests.filter((request) => request.type === 'purchase');
        let allSellRequests = requests.filter((request) => request.type === 'sell');
        allPurchaseRequests = allPurchaseRequests.sort((a, b) => a.amount - b.amount);
        allPurchaseRequests = allPurchaseRequests.sort((a, b) => b.dateCreated - a.dateCreated);
        allSellRequests = allSellRequests.sort((a, b) => b.amount - a.amount);
        const allContracts = (await this.contractDao.getContracts())
            .filter((contract) => !contract.isFulfilled)
            .sort((a, b) => b.unsoldAmount / b.saleAmount - a.unsoldAmount / a.saleAmount);
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
                await this.cashDepositDao.makeDeposit(-transactionAmount, currentSell.investor);
                await this.requestDao.saveRequest(currentSell);
                if (currentSell.amount === 0) {
                    await this.requestDao.deleteRequest(currentSell.id);
                    currentSell = allSellRequests.pop() || allContracts.pop();
                }
            } else {
                const transactionAmount = Math.min(currentSell.unsoldAmount, currentPurchase.amount);
                const investment = await this.takeAssets(transactionAmount,
                    currentSell.homeowner, currentPurchase.investor);
                if (!investment) {
                    throw new Error('Bad');
                }
                currentPurchase.amount -= transactionAmount;
                currentSell.investments.push(investment);
                if (currentSell.isFulfilled) {
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
                    throw new Error('SEVERE');
                }
                amount -= await this.investmentDao.transferInvestment(curInvestment.id,
                    from as IPersistedInvestor, to, amount);
                amount = Math.max(amount, 0);
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
            const toCreate = new StorableInvestment(contract.id, amount, to.id);
            const oldValue = contract.unsoldAmount;
            const newInvestment = await this.investmentDao.createInvestment(toCreate);
            contract.investments.push(newInvestment);
            assert(Math.round(oldValue - amount) === Math.round(contract.unsoldAmount),
                `Value didnt decrease by the right amount, ${oldValue}, ${amount}, ${contract.unsoldAmount}`);
            return newInvestment;
        }
    }


    private async mergeInvestments(): Promise<void> {
        const investments = await this.investmentDao.getInvestments();
        const investorContractToInvestment: Map<string, IPersistedInvestment> = new Map();
        for (const investment of investments) {
            const key: string = `${investment.contract.id}, ${investment.owner.id}, ${investment.sellDate}, ${investment.purchaseDate}`;
            const current = investorContractToInvestment.get(key);
            if (!current) {
                investorContractToInvestment.set(key, investment);
            } else {
                current.amount += investment.amount;
                await this.investmentDao.deleteInvestment(investment.id);
                await this.investmentDao.saveInvestment(current);
            }
        }
        return;
    }
}

function isRequest(a: any): a is IPersistedRequest {
    return a.type === 'purchase' || a.type === 'sell';
}
