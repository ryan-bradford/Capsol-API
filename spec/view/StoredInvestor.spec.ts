import {
    StoredInvestor, IPersistedInvestor, IPersistedInvestment, IPersistedContract,
    IPersistedHomeowner, IPersistedCashDeposit,
} from '@entities';
import { expect } from 'chai';

describe('Testing stored investor', () => {

    it('should convert the investor into the proper view', () => {
        const homeowner: IPersistedHomeowner = {
            name: 'Mary',
            admin: false,
            id: 'asojnda',
            pwdHash: 'skjndf',
            email: 'mary@gmail.com',
        };
        const investor: IPersistedInvestor = {
            name: 'Mary',
            admin: false,
            id: 'asojnda',
            pwdHash: 'skjndf',
            email: 'mary@gmail.com',
            requests: [],
            cashDeposits: [],
            investments: [],
        };
        const contractA: IPersistedContract = {
            id: 'askjnd',
            saleAmount: 1000,
            monthlyPayment: 100,
            investments: [],
            homeowner,
            firstPaymentDate: 1,
            totalLength: 20,
            isFulfilled: () => true,
            monthsPassed: () => 1,
            depreciationValue: () => 10,
            unsoldAmount: () => 0,
        };
        const investments: IPersistedInvestment[] = [
            {
                id: 'sakjnda',
                contract: contractA,
                amount: 1000,
                owner: investor,
                purchaseDate: 0,
                sellDate: 2,
                value: () => 1000,
            },
        ];
        const cashDeposits: IPersistedCashDeposit[] = [
            {
                id: 'aaas',
                amount: 1000,
                user: investor,
                date: 0,
            }, {
                id: 'aaas',
                amount: -1000,
                user: investor,
                date: 2,
            },
        ];
        const viewData = StoredInvestor.fromData(investor, investments, cashDeposits, 1000, 0, 2);
        expect(viewData.portfolioHistory.length).to.be.equal(3);
        expect(viewData.portfolioHistory.map((hist) => hist.totalValue)).to.be.deep.equal([1000, 1050, 100]);
    });

});
