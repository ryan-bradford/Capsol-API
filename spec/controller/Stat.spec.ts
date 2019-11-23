import { StatController } from '@controller';
import { IStatService } from 'src/services/stat/StatService';
import { IStoredPortfolioHistory, StoredHomeowner, StoredInvestorStat, StoredHomeownerStat } from '@entities';
import { mockResponse, ResponseOutput, mockRequest } from 'mock-req-res';
import { expect } from 'chai';
import { OK } from 'http-status-codes';
import sinon from 'sinon';

describe('StatController', () => {

    let controller: StatController;
    before(() => {
        controller = new StatController(0, new MockStatService());
    });

    describe(`GET Historical performance`, () => {
        const callApi = async (): Promise<ResponseOutput> => {
            const res = mockResponse();
            await controller.getHistoricalPerformance(mockRequest(), res);
            return res;
        };

        it('should return the history', (done) => {
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith({ portfolioHistory: [], interestRate: 0 });
                    done();
                });
        });

        it('should return a 400', (done) => {
            sinon.stub(MockStatService.prototype, 'getPortfolioHistory')
                .throws(new Error('Database query failed.'));
            callApi()
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });
    });

    describe(`GET Homeowner Statistics`, () => {
        const callApi = async (): Promise<ResponseOutput> => {
            const res = mockResponse();
            await controller.getHomeownerStats(mockRequest(), res);
            return res;
        };

        it('should return the stats for the homeowner', (done) => {
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith(new StoredHomeownerStat(10, 10, 1000));
                    done();
                });
        });

        it('should return a 400', (done) => {
            sinon.stub(MockStatService.prototype, 'getGreenImpact')
                .throws(new Error('Database query failed.'));
            callApi()
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });
    });

    describe(`GET Investor Statistics`, () => {
        const callApi = async (): Promise<ResponseOutput> => {
            const res = mockResponse();
            await controller.getInvestorStat(mockRequest(), res);
            return res;
        };

        it('should return the stats for the investor', (done) => {
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith(new StoredInvestorStat(10, 1000, 0));
                    done();
                });
        });

        it('should return a 400', (done) => {
            sinon.stub(MockStatService.prototype, 'getGreenImpact')
                .throws(new Error('Database query failed.'));
            callApi()
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });
    });

});

class MockStatService implements IStatService {
    public async getMoneyManaged(): Promise<number> {
        return 1000;
    }


    public async getGreenImpact(): Promise<number> {
        return 10;
    }


    public async getSolarContracts(): Promise<number> {
        return 10;
    }


    public async getTotalSavings(): Promise<number> {
        return 1000;
    }


    public async getPortfolioHistory(): Promise<IStoredPortfolioHistory[]> {
        return [];
    }
}
