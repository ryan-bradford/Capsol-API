
import { OK, CREATED, NOT_FOUND, BAD_REQUEST } from 'http-status-codes';
import { pErr, logger, pwdSaltRounds } from '@shared';
import { IUserDao } from '@daos';
import { IContractService } from '@services';
import bcrypt from 'bcrypt';
import sinon from 'sinon';
import { Response } from 'express';
import {
    IPersistedHomeowner, IStoredHomeowner,
    PersistedHomeowner, IPersistedContract, PersistedContract, PersistedInvestor,
} from '@entities';
import { expect } from 'chai';
import { mockRequest, mockResponse, ResponseOutput } from 'mock-req-res';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import HomeownerController from 'src/controller/Homeowner';

chai.use(sinonChai);

const startHomeowners = {
    users: [
        {
            id: 1,
            name: 'Ryan',
            email: 'test@gmail.com',
            admin: false,
            pwdHash: '1',
            purchaseRequests: [],
        },
    ],
};

const nextUser = {
    id: 2,
    name: 'Emma',
    email: 'blorg@gmail.com',
    pwdHash: '2',
    purchaseRequests: [],
};


describe('HomeownerRouter', () => {

    const homeownerPath = '/homeowners';

    let homeownerController: HomeownerController;

    before(() => {
        homeownerController = new HomeownerController(
            new MockHomeownerDao(),
            new MockContractService());
    });

    describe(`"GET":${homeownerPath}`, () => {

        const callApi = async (): Promise<ResponseOutput> => {
            const res = mockResponse();
            const result = await homeownerController.getUsers(mockRequest(), res);
            return res;
        };

        it('should return all users', (done) => {
            callApi()
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith({ users: startHomeowners.users });
                    done();
                });
        });

        it('should return a 400', (done) => {
            sinon.stub(MockHomeownerDao.prototype, 'getAll').throws(new Error('Database query failed.'));
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
            await homeownerController.addUser(mockRequest({ body }), res);
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
            sinon.stub(MockHomeownerDao.prototype, 'add').throws(new Error('Database query failed.'));
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
            await homeownerController.deleteUser(mockRequest({ params: { email } }), res);
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
            sinon.stub(MockHomeownerDao.prototype, 'delete').throws(new Error('Database query failed.'));
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
            await homeownerController.getUser(mockRequest({ params: { email } }), res);
            return res;
        };

        it('should delete a single user', (done) => {
            callApi('test@gmail.com')
                .then((res) => {
                    expect(res.status).to.be.calledWith(OK);
                    expect(res.json).to.be.calledWith(startHomeowners.users[0]);
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
            sinon.stub(MockHomeownerDao.prototype, 'getOne').throws(new Error('Database query failed.'));
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

        const callApi = async (email?: any, amount?: any) => {
            const res = mockResponse();
            await homeownerController.signUpHome(
                mockRequest({ params: { email }, body: amount ? { amount } : undefined }), res);
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
            sinon.stub(MockContractService.prototype, 'createContract').throws(new Error('Database query failed.'));
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
class MockHomeownerDao implements IUserDao<IPersistedHomeowner, IStoredHomeowner> {

    private examples: IPersistedHomeowner[] = Object.values(Object.assign({}, startHomeowners.users));


    constructor() {
        this.examples[0].id = 1;
    }


    public getOne(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        if (emailOrId === 'test@gmail.com') {
            return Promise.resolve(this.examples[0]);
        } else {
            return Promise.resolve(null);
        }
    }


    public getAll(): Promise<IPersistedHomeowner[]> {
        return Promise.resolve(this.examples);
    }


    public add(user: IStoredHomeowner): Promise<IPersistedHomeowner> {
        return Promise.resolve(new PersistedHomeowner());
    }


    public delete(id: number): Promise<void> {
        if (id === 1) {
            return Promise.resolve();
        }
        throw new Error('Not found');
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockContractService implements IContractService {


    public createContract(amount: number, interestRate: number, years: number, userId: number):
        Promise<IPersistedContract> {
        const toReturn = new PersistedContract();
        toReturn.id = 5;
        toReturn.investments = [];
        toReturn.length = years;
        toReturn.saleAmount = amount;
        return Promise.resolve(toReturn);
    }

}

function hashPwd(pwd: string) {
    return bcrypt.hashSync(pwd, pwdSaltRounds);
}
