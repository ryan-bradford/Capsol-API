
import { OK, CREATED, NOT_FOUND, BAD_REQUEST } from 'http-status-codes';
import { IUserDao } from '@daos';
import { IInvestmentService } from '@services';
import sinon from 'sinon';
import { Response } from 'express';
import {
    PersistedInvestor, IStoredInvestor, IPersistedInvestor,
    IPersistedInvestment,
} from '@entities';
import { expect } from 'chai';
import { mockRequest, mockResponse } from 'mock-req-res';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import InvestorController from 'src/controller/Investor';
import { start } from 'repl';

chai.use(sinonChai);

const startInvestors: { users: IPersistedInvestor[] } = {
    users: [
        {
            id: 1,
            name: 'Ryan',
            email: 'test@gmail.com',
            admin: false,
            pwdHash: '1',
            requests: [],
        },
    ],
};

const nextUser: IStoredInvestor = {
    id: 2,
    name: 'Emma',
    email: 'blorg@gmail.com',
    pwdHash: '2',
    requests: [],
    investments: [],
};


describe('HomeownerRouter', () => {

    const homeownerPath = '/homeowners';

    let investorController: InvestorController;

    before(() => {
        investorController = new InvestorController(
            new MockInvestorDao(),
            new MockInvestmentService());
    });

    describe(`"GET":${homeownerPath}`, () => {

        const callApi = async () => {
            const res = mockResponse();
            await investorController.getAll(mockRequest(), res);
            return res;
        };

        it('should return all users', (done) => {
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith({ users: startInvestors.users });
                    done();
                });
        });

        it('should return a 400', (done) => {
            sinon.stub(MockInvestorDao.prototype, 'getAll').throws(new Error('Database query failed.'));
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(BAD_REQUEST);
                    sinon.restore();
                    done();
                });
        });
    });

    describe(`"POST":${homeownerPath}`, () => {

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
                .then((res) => {
                    expect(res.status.calledWith(BAD_REQUEST)).to.equal(true);
                    expect(res.json)
                        .to.be.calledWith({ error: 'One or more of the required parameters was missing.' });
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            sinon.stub(MockInvestorDao.prototype, 'add').throws(new Error('Database query failed.'));
            callApi({ user: nextUser })
                .then((res) => {
                    expect(res.status).to.be.calledWith(BAD_REQUEST);
                    expect(res.json).to.be.calledWith({ error: 'Database query failed.' });
                    sinon.restore();
                    done();
                });
        });

    });

    describe(`"DELETE":${homeownerPath}/email`, () => {

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
                .then((res) => {
                    expect(res.status).to.be.calledWith(NOT_FOUND);
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            sinon.stub(MockInvestorDao.prototype, 'delete').throws(new Error('Database query failed.'));
            callApi('test@gmail.com')
                .then((res) => {
                    expect(res.status).to.be.calledWith(BAD_REQUEST);
                    expect(res.json).to.be.calledWith({ error: 'Database query failed.' });
                    sinon.restore();
                    done();
                });
        });

    });

    describe(`"GET":${homeownerPath}/email`, () => {

        const callApi = async (email?: any) => {
            const res = mockResponse();
            await investorController.getInvestor(mockRequest({ params: { email } }), res);
            return res;
        };

        it('should delete a single user', (done) => {
            callApi('test@gmail.com')
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith(startInvestors.users[0]);
                    done();
                });
        });

        it('should give 404 for not found', (done) => {
            callApi('test2@gmail.com')
                .then((res) => {
                    expect(res.status).to.be.calledWith(NOT_FOUND);
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            sinon.stub(MockInvestorDao.prototype, 'getOne').throws(new Error('Database query failed.'));
            callApi('test@gmail.com')
                .then((res) => {
                    expect(res.status).to.be.calledWith(BAD_REQUEST);
                    expect(res.json).to.be.calledWith({ error: 'Database query failed.' });
                    sinon.restore();
                    done();
                });
        });

    });

    describe(`"PUT":${homeownerPath}/email/home`, () => {

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
                .then((res) => {
                    expect(res.status).to.be.calledWith(NOT_FOUND);
                    done();
                });
        });

        it('should fail if the contract service fails', (done) => {
            sinon.stub(MockInvestmentService.prototype, 'addFunds').throws(new Error('Database query failed.'));
            callApi('test@gmail.com', 100)
                .then((res) => {
                    expect(res.status).to.be.calledWith(BAD_REQUEST);
                    expect(res.json).to.be.calledWith({ error: 'Database query failed.' });
                    sinon.restore();
                    done();
                });
        });

        it('should fail if amount is not included', (done) => {
            callApi('test@gmail.com')
                .then((res) => {
                    expect(res.status).to.be.calledWith(BAD_REQUEST);
                    done();
                });
        });

    });
});


// tslint:disable-next-line: max-classes-per-file
class MockInvestorDao implements IUserDao<IPersistedInvestor, IStoredInvestor> {

    private examples: IPersistedInvestor[] = Object.values(Object.assign({}, startInvestors.users));


    constructor() {
        this.examples[0].id = 1;
    }


    public getOne(emailOrId: string | number): Promise<IPersistedInvestor | null> {
        if (emailOrId === 'test@gmail.com') {
            return Promise.resolve(this.examples[0]);
        } else {
            return Promise.resolve(null);
        }
    }


    public getAll(): Promise<IPersistedInvestor[]> {
        return Promise.resolve(this.examples);
    }


    public add(user: IStoredInvestor): Promise<IPersistedInvestor> {
        return Promise.resolve(new PersistedInvestor());
    }


    public delete(id: number): Promise<void> {
        if (id === 1) {
            return Promise.resolve();
        }
        throw new Error('Not found');
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockInvestmentService implements IInvestmentService {


    public addFunds(userId: number, amount: number): Promise<IPersistedInvestment[]> {
        return Promise.resolve([]);
    }


    public sellInvestments(userId: number, amount: number): Promise<void> {
        return Promise.resolve();
    }

}

