
import { OK, CREATED } from 'http-status-codes';
import { IUserDao } from '@daos';
import { IInvestmentService, IRequestService } from '@services';
import sinon from 'sinon';
import { Response } from 'express';
import {
    PersistedInvestor, IStoredInvestor, IPersistedInvestor,
    IPersistedInvestment,
    StoredInvestor,
    IStorableInvestor,
    IPersistedCashDeposit,
    IPersistedHomeowner,
    IStorableHomeowner,
} from '@entities';
import { expect } from 'chai';
import { mockRequest, mockResponse } from 'mock-req-res';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import InvestorController from 'src/controller/Investor';
import { ICashDepositDao } from 'src/daos/investment/CashDepositDao';
import { IDateService } from 'src/services/DateService';

chai.use(sinonChai);

const startInvestors: { users: IPersistedInvestor[] } = {
    users: [
        {
            id: 'a',
            name: 'Ryan',
            email: 'test@gmail.com',
            admin: false,
            pwdHash: '1',
            requests: [],
            cashDeposits: [],
            investments: [],
        },
    ],
};

const nextUser: IStoredInvestor = {
    id: 'b',
    name: 'Emma',
    email: 'blorg@gmail.com',
    pwdHash: '2',
    investments: [],
    totalCash: 1,
    portfolioHistory: [],
    interestRate: 0,
};


describe('InvestorRouter', () => {

    const investorPath = '/investor';

    let investorController: InvestorController;

    before(() => {
        investorController = new InvestorController(
            new MockInvestorDao(),
            new MockHomeownerDao(),
            new MockInvestmentService(),
            new MockRequestService(),
            new MockCashDepositDao(), new MockDateService(), 0);
    });

    describe(`"GET":${investorPath}`, () => {

        const callApi = async () => {
            const res = mockResponse();
            await investorController.getAll(mockRequest(), res);
            return res;
        };

        it('should return all users', (done) => {
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith({
                        users: startInvestors.users.map((user) => {
                            return new StoredInvestor(user, 1, [], [], 0);
                        }),
                    });
                    done();

                });
        });

        it('should return a 400', (done) => {
            sinon.stub(MockInvestorDao.prototype, 'getAll').throws(new Error('Database query failed.'));
            callApi()
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });
    });

    describe(`"POST":${investorPath}`, () => {

        const callApi = async (body?: any) => {
            const res = mockResponse();
            await investorController.addInvestor(mockRequest({ body }), res);
            return res;
        };

        it('should allow adding a user', (done) => {
            callApi({ user: nextUser })
                .then((res) => {
                    expect(res.status).to.be.calledWith(CREATED);
                    done();
                });
        });

        it('should fail if missing the user', (done) => {
            callApi({})
                .catch((error) => {
                    expect(error.message).to.not.be.equal(undefined);
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            sinon.stub(MockInvestorDao.prototype, 'add').throws(new Error('Database query failed.'));
            callApi({ user: nextUser })
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });

    });

    describe(`"DELETE":${investorPath}/email`, () => {

        const callApi = async (email?: any) => {
            const res = mockResponse();
            await investorController.deleteInvestor(mockRequest({ params: { email } }), res);
            return res;
        };

        it('should give information about a single user', (done) => {
            callApi('test@gmail.com')
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    done();
                });
        });

        it('should give 404 for not found', (done) => {
            callApi('test2@gmail.com')
                .catch((error) => {
                    expect(error.type).to.contain('NOT_FOUND');
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            sinon.stub(MockInvestorDao.prototype, 'delete').throws(new Error('Database query failed.'));
            callApi('test@gmail.com')
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });

    });

    describe(`"GET":${investorPath}/email`, () => {

        const callApi = async (email?: any) => {
            const res = mockResponse();
            await investorController.getInvestor(mockRequest({ params: { email } }), res);
            return res;
        };

        it('should delete a single user', (done) => {
            callApi('test@gmail.com')
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith(new StoredInvestor(startInvestors.users[0], 1, [], [], 0));
                    done();
                });
        });

        it('should give 404 for not found', (done) => {
            callApi('test2@gmail.com')
                .catch((error) => {
                    expect(error.type).to.contain('NOT_FOUND');
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            sinon.stub(MockInvestorDao.prototype, 'getOneByEmail').throws(new Error('Database query failed.'));
            callApi('test@gmail.com')
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });

    });

    describe(`"PUT":${investorPath}/email/home`, () => {

        const callApi = async (email?: any, amount?: any): Promise<Response> => {
            const res = mockResponse();
            await investorController.addInvestment(
                mockRequest({ params: { email }, body: amount ? { amount } : undefined }),
                res);
            return res;

        };

        it('should add contract for a single user', (done) => {
            callApi('test@gmail.com', 10000)
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    done();
                });
        });

        it('should give 404 for not found', (done) => {
            callApi('test2@gmail.com', 100)
                .catch((error) => {
                    expect(error.type).to.contain('NOT_FOUND');
                    done();
                });
        });

        it('should fail if the contract service fails', (done) => {
            sinon.stub(MockInvestmentService.prototype, 'addFunds').throws(new Error('Database query failed.'));
            callApi('test@gmail.com', 100)
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });

        it('should fail if amount is not included', (done) => {
            callApi('test@gmail.com')
                .catch((error) => {
                    done();
                });
        });

    });
});


// tslint:disable-next-line: max-classes-per-file
class MockInvestorDao implements IUserDao<IPersistedInvestor, IStorableInvestor> {

    private examples: IPersistedInvestor[] = Object.values(Object.assign({}, startInvestors.users));


    constructor() {
        this.examples[0].id = 'a';
    }


    public getOne(emailOrId: string | number): Promise<IPersistedInvestor | null> {
        if (emailOrId === 'test@gmail.com') {
            return Promise.resolve(this.examples[0]);
        } else {
            return Promise.resolve(null);
        }
    }


    public getOneByEmail(emailOrId: string | number): Promise<IPersistedInvestor | null> {
        if (emailOrId === 'test@gmail.com') {
            return Promise.resolve(this.examples[0]);
        } else {
            return Promise.resolve(null);
        }
    }


    public getAll(): Promise<IPersistedInvestor[]> {
        return Promise.resolve(this.examples);
    }


    public add(user: IStorableInvestor): Promise<IPersistedInvestor> {
        return Promise.resolve(new PersistedInvestor());
    }


    public delete(id: string): Promise<void> {
        if (id === 'a') {
            return Promise.resolve();
        }
        throw new Error('Not found');
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockInvestmentService implements IInvestmentService {


    public addFunds(userId: string, amount: number): Promise<IPersistedInvestment[]> {
        return Promise.resolve([]);
    }


    public sellInvestments(userId: string, amount: number): Promise<void> {
        return Promise.resolve();
    }


    public getCashValue(userId: string): Promise<number> {
        return Promise.resolve(1);
    }


    public getInvestmentsFor(userId: string): Promise<IPersistedInvestment[]> {
        return Promise.resolve([]);
    }


}


// tslint:disable-next-line: max-classes-per-file
class MockRequestService implements IRequestService {


    public createPurchaseRequest(user: IPersistedInvestor, amount: number): Promise<number> {
        return Promise.resolve(0);
    }


    public createSellRequest(user: IPersistedInvestor, amount: number): Promise<void> {
        return Promise.resolve();
    }


    public handleRequests(): Promise<void> {
        return Promise.resolve();
    }
}

// tslint:disable-next-line: max-classes-per-file
class MockCashDepositDao implements ICashDepositDao {


    public makeDeposit(amount: number, date: number, user: IPersistedInvestor): Promise<void> {
        return Promise.resolve();
    }


    public getDepositsFor(user: IPersistedInvestor): Promise<IPersistedCashDeposit[]> {
        return Promise.resolve([]);
    }


}

// tslint:disable-next-line: max-classes-per-file
class MockDateService implements IDateService {


    public getDateAsNumber(): Promise<number> {
        return Promise.resolve(1);
    }


    public tickTime(): Promise<void> {
        return Promise.resolve();
    }


    public calibrateMonth(): Promise<number> {
        return Promise.resolve(1);
    }
}

// tslint:disable-next-line: max-classes-per-file
class MockHomeownerDao implements IUserDao<IPersistedHomeowner, IStorableHomeowner> {

    private examples: IPersistedHomeowner[] = [];


    public getOne(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        return Promise.resolve(null);
    }


    public getOneByEmail(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        return Promise.resolve(null);
    }


    public getAll(): Promise<IPersistedHomeowner[]> {
        return Promise.resolve(this.examples);
    }


    public add(user: IStorableHomeowner): Promise<IPersistedHomeowner> {
        return Promise.resolve(new PersistedInvestor());
    }


    public delete(id: string): Promise<void> {
        if (id === 'a') {
            return Promise.resolve();
        }
        throw new Error('Not found');
    }

}
