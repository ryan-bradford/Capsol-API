import { EstimateController } from '@controller';
import { IEstimateService } from 'src/services/estimation/EstimateService';
import { ResponseOutput, mockResponse, mockRequest } from 'mock-req-res';
import { expect } from 'chai';
import { OK } from 'http-status-codes';
import sinon from 'sinon';
import {
    IStoredHomeownerEstimate, IStoredInvestorEstimate, IPersistedContract,
    StoredHomeownerEstimate, StoredInvestorEstimate,
} from '@entities';
import { IContractService } from '@services';

describe('StatController', () => {

    let controller: EstimateController;
    before(() => {
        controller = new EstimateController(new MockEstimateService(), new MockContractService());
    });

    describe(`GET Homeowner Estimate`, () => {
        const callApi = async (): Promise<ResponseOutput> => {
            const res = mockResponse();
            await controller.getHomeownerEstimate(mockRequest({
                query: {
                    amount: 100,
                    address: 'Boston, MA',
                },
            }), res);
            return res;
        };

        it('should return the estimate', (done) => {
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    const result = new StoredHomeownerEstimate(1000, 1, 1, 10, 20);
                    result.monthlyPayment = 100;
                    expect(res.json).to.be.calledWith(result);
                    done();
                });
        });

        it('should return a 400', (done) => {
            sinon.stub(MockEstimateService.prototype, 'getHomeownerEstimate')
                .throws(new Error('Database query failed.'));
            callApi()
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });
    });

    describe(`GET Investor Estimate`, () => {
        const callApi = async (): Promise<ResponseOutput> => {
            const res = mockResponse();
            await controller.getInvestorEstimate(mockRequest({
                query: {
                    amount: 100,
                },
            }), res);
            return res;
        };

        it('should return the estimate', (done) => {
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    const result = new StoredInvestorEstimate(100, 100, 100, 10, 10);
                    expect(res.json).to.be.calledWith(result);
                    done();
                });
        });

        it('should return a 400', (done) => {
            sinon.stub(MockEstimateService.prototype, 'getInvestorEstimate')
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

class MockEstimateService implements IEstimateService {


    public async getHomeownerEstimate(electricityUsage: number, address: string): Promise<IStoredHomeownerEstimate> {
        return new StoredHomeownerEstimate(1000, 1, 1, 10, 20);
    }


    public async getInvestorEstimate(initialAmount: number): Promise<IStoredInvestorEstimate> {
        return new StoredInvestorEstimate(100, 100, 100, 10, 10);
    }

}


// tslint:disable-next-line: max-classes-per-file
class MockContractService implements IContractService {


    public async createContract(amount: number, userId: string): Promise<IPersistedContract> {
        throw new Error('Method not implemented.');
    }


    public async makePayment(email: string, date: number): Promise<number | null> {
        throw new Error('Method not implemented.');
    }


    public async getContractPrice(amount: number, length: number): Promise<number> {
        return 100;
    }
}
