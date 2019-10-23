import { IStoredUser, IStoredInvestment, StoredUser, IStoredPortfolioHistory } from '@entities';
import { IPersistedInvestor } from './PersistedInvestor';
import { IPersistedInvestment } from 'src/entities/investment/investment/PersistedInvestment';
import { IPersistedCashDeposit } from 'src/entities/investment/cash/PersistedCashDeposit';
import { StoredInvestment } from 'src/entities/investment/investment/StoredInvestment';
import { StoredPortfolioHistory } from 'src/entities/investment/portfolio/StoredPortfolioHistory';
import { getDateAsNumber } from '@shared';

export interface IStoredInvestor extends IStoredUser {
    totalCash: number;
    investments: IStoredInvestment[];
    portfolioHistory: IStoredPortfolioHistory[];
}

export class StoredInvestor extends StoredUser implements IStoredInvestor {

    public totalCash: number;
    public investments: IStoredInvestment[];
    public portfolioHistory: IStoredPortfolioHistory[];


    constructor(id: string | IPersistedInvestor, totalCash: number, investments: IStoredInvestment[],
        // tslint:disable-next-line: align
        portfolioHistory: IStoredPortfolioHistory[], name?: string, email?: string, pwdHash?: string) {
        super(id, name, email, pwdHash);
        this.totalCash = totalCash;
        this.investments = investments;
        this.portfolioHistory = portfolioHistory;
    }


    public static fromData(
        investor: IPersistedInvestor,
        investments: IPersistedInvestment[],
        cashDeposits: IPersistedCashDeposit[],
        portfolioValue: number): IStoredInvestor {
        const storedInvestments = investments.map((investment) =>
            new StoredInvestment(investment.id, investment.amount, investment.contract.totalLength,
                investment.contract.firstPaymentDate, investment.owner.id,
                investment.contract.monthlyPayment * investment.amount / investment.contract.saleAmount));
        const portfolioHistory: IStoredPortfolioHistory[] = [];
        for (let i = getEarliestMonth(investments, cashDeposits); i <= getDateAsNumber(); i++) {
            const cash = getCashValueAtMonth(cashDeposits, i);
            const investmentReturns = getNetReturnsAtMonth(investments, i);
            portfolioHistory.push(new StoredPortfolioHistory(i, cash, investmentReturns + cash));
        }
        return new StoredInvestor(investor, portfolioValue, storedInvestments, portfolioHistory);
    }

}

function getEarliestMonth(investments: IPersistedInvestment[], cashDeposits: IPersistedCashDeposit[]): number {
    let minMonth = 100000;
    investments.map((investment) => minMonth = Math.min(minMonth, investment.purchaseDate));
    cashDeposits.map((cash) => minMonth = Math.min(minMonth, cash.date));
    return minMonth;
}

function getCashValueAtMonth(cashDeposits: IPersistedCashDeposit[], month: number) {
    let totalValue = 0;
    cashDeposits.forEach((cash) => totalValue += cash.date <= month ? cash.amount : 0);
    return totalValue;
}

function getNetReturnsAtMonth(investments: IPersistedInvestment[], month: number): number {
    let total = 0;
    investments.forEach((investment) => total += getInvestmentReturnedAtMonth(investment, month));
    investments.forEach((investment) => total += getInvestmentValueAtMonth(investment, month) - investment.amount);
    return total;
}

function getInvestmentReturnedAtMonth(investment: IPersistedInvestment, month: number): number {
    if (investment.contract.firstPaymentDate === null) {
        return 0;
    }
    if (month < investment.contract.firstPaymentDate) {
        return 0;
    }
    const monthlyIncome = investment.contract.monthlyPayment * investment.amount / investment.contract.saleAmount;
    if (month - investment.contract.firstPaymentDate > investment.contract.totalLength) {
        return monthlyIncome * investment.contract.totalLength;
    }
    const endMonth = Math.min(month, investment.sellDate ? investment.sellDate : month);
    return ((endMonth - investment.contract.firstPaymentDate) + 1) * monthlyIncome;
}


function getInvestmentValueAtMonth(investment: IPersistedInvestment, month: number): number {
    if (investment.sellDate !== null && investment.sellDate >= month) {
        return 0;
    }
    if (investment.contract.firstPaymentDate === null) {
        return investment.amount;
    }
    if (month < investment.contract.firstPaymentDate) {
        return investment.amount;
    }
    if (month - investment.contract.firstPaymentDate > investment.contract.totalLength) {
        return 0;
    }
    return investment.amount - investment.amount *
        (month - investment.contract.firstPaymentDate) / investment.contract.totalLength;
}

