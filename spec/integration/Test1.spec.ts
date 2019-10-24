import {
    addInvestor, addInvestment, addContract, addHomeowner,
    tickMonth, handleRequests, startApp, appInstance, cookie, sellInvestment, getInvestor, getHomeowner,
} from './IntegrationHelp';
import { expect } from 'chai';

describe('Integration 1', function test() {
    this.timeout(50000);

    let homeownerEmail = '';
    let investorAEmail = '';
    let investorBEmail = '';

    before((done) => {
        startApp(0).then(done);
    });

    describe('Add Homeowner', () => {
        it('should let me add a homeowner with no prolems', (done) => {
            addHomeowner().then((result) => {
                homeownerEmail = result;
                done();
            });
        });

        it('should let me add a homeowner contract with no prolems', (done) => {
            addContract(homeownerEmail, 10000).then(done);
        });
    });

    describe('Tick Time', () => {
        it('should tick time with no prolem', (done) => {
            tickMonth().then(done);
        });
    });

    describe('Add Investor', () => {
        it('should let me add an investor with no prolems', (done) => {
            addInvestor().then((result) => {
                investorAEmail = result;
                done();
            });
        });

        it('should let me add a investment with no prolems', (done) => {
            addInvestment(investorAEmail, 8000).then(done);
        });

        it('should return this new investor', (done) => {
            getInvestor(investorAEmail).then((result) => {
                expect(result.totalCash).to.be.equal(8000);
                done();
            });
        });
    });

    describe('Tick Time', () => {
        it('should tick time with no problem', (done) => {
            tickMonth().then(done);
        });
    });

    describe('Add Investor2', () => {
        it('should let me add an investor with no prolems', (done) => {
            addInvestor().then((result) => {
                investorBEmail = result;
                done();
            });
        });

        it('should let me add a investment with no prolems', (done) => {
            addInvestment(investorBEmail, 4000).then(done);
        });
    });

    describe('Handle Requests', () => {
        it('should match the requests with no problem', (done) => {
            handleRequests().then(done);
        });

        it('should return both investors', (done) => {
            getInvestor(investorAEmail).then((result) => {
                expect(result.totalCash).to.be.equal(0);
                expect(result.investments.length).to.be.equal(1);
                return getInvestor(investorBEmail);
            }).then((result) => {
                expect(result.totalCash).to.be.equal(2000);
                expect(result.investments.length).to.be.equal(1);
                done();
            });
        });
    });

    describe('Tick Time', () => {
        it('should tick time with no prolem', (done) => {
            tickMonth().then(() => getHomeowner(homeownerEmail))
                .then((homeowner) => {
                    expect(homeowner.contract.firstPaymentDate).to.be.not.equal(null);
                    done();
                });
        });

        it('should reflect the new payments in the investors portfolio', (done) => {
            getInvestor(investorAEmail).then((result) => {
                expect(result.totalCash).to.be.equal(60);
                expect(result.investments.length).to.be.equal(1);
                expect(Math.round(result.portfolioHistory[0].month)).to.be.equal(2);
                expect(Math.round(result.portfolioHistory[0].totalValue)).to.be.equal(8000);
                expect(Math.round(result.portfolioHistory[1].month)).to.be.equal(3);
                expect(Math.round(result.portfolioHistory[1].totalValue)).to.be.equal(8027);
                expect(Math.round(result.portfolioHistory[2].month)).to.be.equal(4);
                expect(Math.round(result.portfolioHistory[2].totalValue)).to.be.equal(8053);
                return getInvestor(investorBEmail);
            }).then((result) => {
                expect(result.totalCash).to.be.equal(2015);
                expect(result.investments.length).to.be.equal(1);
                expect(Math.round(result.portfolioHistory[1].month)).to.be.equal(4);
                expect(Math.round(result.portfolioHistory[1].totalValue)).to.be.equal(4013);
                done();
            });
        });
    });

    describe('Sell Investment', () => {
        it('should let investor A sell her investment', (done) => {
            sellInvestment(investorAEmail, 2000).then(done);
        });
    });

    describe('Handle Requests', () => {
        it('should match the requests with no problem', (done) => {
            handleRequests().then(done);
        });
    });

    describe('Tick Time', () => {
        it('should tick time with no prolem', (done) => {
            tickMonth().then((result) => getInvestor(investorAEmail))
                .then((result) => {
                    expect(result.totalCash).to.be.equal(105);
                    expect(result.investments.length).to.be.equal(2);
                    expect(Math.round(result.portfolioHistory[0].month)).to.be.equal(2);
                    expect(Math.round(result.portfolioHistory[0].totalValue)).to.be.equal(8000);
                    expect(Math.round(result.portfolioHistory[1].month)).to.be.equal(3);
                    expect(Math.round(result.portfolioHistory[1].totalValue)).to.be.equal(8027);
                    expect(Math.round(result.portfolioHistory[2].month)).to.be.equal(4);
                    expect(Math.round(result.portfolioHistory[2].totalValue)).to.be.equal(6055);
                    expect(Math.round(result.portfolioHistory[3].month)).to.be.equal(5);
                    expect(Math.round(result.portfolioHistory[3].totalValue)).to.be.equal(6075);
                    return getInvestor(investorBEmail);
                }).then((result) => {
                    expect(result.totalCash).to.be.equal(45);
                    expect(result.investments.length).to.be.equal(2);
                    expect(Math.round(result.portfolioHistory[2].totalValue)).to.be.equal(4025);
                    done();
                });
        });
    });
    // Add a Homeowner with a contract of 10000
    // Tick time
    // Add an Investor with an investment size of 8000
    // Tick time
    // Add an Investor with an investment size of 4000
    // Handle requests
    // Tick time
    // Investor A sells 2000 of his funds
    // Handle requests
    // Tick time
});
