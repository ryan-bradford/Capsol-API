import { IStoredUser, IStoredInvestment, StoredUser, IStoredPortfolioHistory } from '@entities';
import { IPersistedInvestor } from './PersistedInvestor';
import { IPersistedInvestment } from 'src/entities/investment/investment/PersistedInvestment';
import { IPersistedCashDeposit } from 'src/entities/investment/cash/PersistedCashDeposit';
import { StoredInvestment } from 'src/entities/investment/investment/StoredInvestment';
import { StoredPortfolioHistory } from 'src/entities/investment/portfolio/StoredPortfolioHistory';

/**
 * The information that should be made public about an investor.
 */
export interface IStoredInvestor extends IStoredUser {
    /**
     * The total cash this investor has uninvested.
     */
    totalCash: number;
    /**
     * All the investments this investor currently owns.
     */
    investments: IStoredInvestment[];
    /**
     * The history of this investors portfolio since the day their account was created.
     */
    portfolioHistory: IStoredPortfolioHistory[];
    /**
     * The interest rate this investor has effectively achieved.
     */
    interestRate: number;
}

export class StoredInvestor extends StoredUser implements IStoredInvestor {

    public totalCash: number;
    public investments: IStoredInvestment[];
    public portfolioHistory: IStoredPortfolioHistory[];
    public interestRate: number;


    constructor(
        id: string | IPersistedInvestor, totalCash: number, investments: IStoredInvestment[],
        portfolioHistory: IStoredPortfolioHistory[], interestRate: number,
        name?: string, email?: string, pwdHash?: string) {
        super(id, name, email, pwdHash);
        this.totalCash = totalCash;
        this.investments = investments;
        this.portfolioHistory = portfolioHistory;
        this.interestRate = interestRate;
    }


    public static fromData(
        investor: IPersistedInvestor,
        investments: IPersistedInvestment[],
        cashDeposits: IPersistedCashDeposit[],
        portfolioValue: number,
        feePercentage: number,
        currentDate: number): IStoredInvestor {
        const storedInvestments = investments.map((investment) =>
            new StoredInvestment(investment.id, investment.amount, investment.contract.totalLength,
                investment.contract.firstPaymentDate, investment.owner.id,
                investment.contract.monthlyPayment * investment.amount / investment.contract.saleAmount));
        const portfolioHistory: IStoredPortfolioHistory[] = [];
        for (let i = getEarliestMonth(investments, cashDeposits); i <= currentDate; i++) {
            const cash = getCashValueAtMonth(cashDeposits, i);
            const investmentReturns = getNetReturnsAtMonth(investments, i, feePercentage);
            portfolioHistory.push(new StoredPortfolioHistory(i, cash, investmentReturns + cash));
        }
        return new StoredInvestor(investor, portfolioValue, storedInvestments, portfolioHistory,
            StoredInvestor.getEffectiveInterest(portfolioHistory));
    }


    public static getEffectiveInterest(history: IStoredPortfolioHistory[]): number {
        let interest: number | null = null;
        for (let i = 1; i < history.length; i++) {
            const periodInterest = 12 * (history[i].totalValue / history[i - 1].totalValue - 1);
            if (interest !== null) {
                interest = (periodInterest + interest * (i - 1)) / i;
            } else {
                interest = periodInterest;
            }
        }
        if (interest === null) {
            return 0;
        }
        return interest;
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

function getNetReturnsAtMonth(investments: IPersistedInvestment[], month: number, feePercentage: number): number {
    let total = 0;
    investments.forEach((investment) => total += getInvestmentReturnedAtMonth(investment, month, feePercentage));
    investments.forEach((investment) => total += getInvestmentDepreciation(investment, month));
    return total;
}

function getInvestmentReturnedAtMonth(investment: IPersistedInvestment, month: number, feePercentage: number): number {
    if (investment.purchaseDate > month ||
        investment.contract.firstPaymentDate === null || month < investment.contract.firstPaymentDate) {
        return 0;
    }
    const monthlyIncome = investment.contract.monthlyPayment * investment.amount / investment.contract.saleAmount;
    if (month - investment.contract.firstPaymentDate > investment.contract.totalLength) {
        return monthlyIncome * investment.contract.totalLength * (1 - feePercentage);
    }
    const endMonth = Math.min(month + 1, investment.sellDate ? investment.sellDate : month + 1);
    const firstMonth = Math.max(investment.contract.firstPaymentDate, investment.purchaseDate);
    return (endMonth - firstMonth) * monthlyIncome * (1 - feePercentage);
}


function getInvestmentDepreciation(investment: IPersistedInvestment, month: number): number {
    if (investment.purchaseDate > month) {
        return 0;
    }
    if ((investment.contract.firstPaymentDate === null || month < investment.contract.firstPaymentDate)
        || (investment.sellDate !== null && investment.sellDate <= month)) {
        return 0;
    }
    return Math.max(investment.amount - investment.amount *
        (month - investment.contract.firstPaymentDate + 1) / investment.contract.totalLength, 0) - investment.amount;
}

