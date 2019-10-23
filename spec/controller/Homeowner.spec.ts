
import { OK, CREATED, NOT_FOUND } from 'http-status-codes';
import { logger, pwdSaltRounds } from '@shared';
import { IUserDao, getDaos } from '@daos';
import { IContractService, InvestmentService, RequestService } from '@services';
import bcrypt from 'bcrypt';
import sinon from 'sinon';
import {
    IPersistedHomeowner, IStoredHomeowner,
    PersistedHomeowner, IPersistedContract, PersistedContract, PersistedInvestor, IStorableHomeowner,
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
            id: 'a',
            name: 'Ryan',
            email: 'test@gmail.com',
            admin: false,
            pwdHash: '1',
            requests: [],
        },
    ],
};

const nextUser = {
    id: 'b',
    name: 'Emma',
    email: 'blorg@gmail.com',
    pwdHash: '2',
    purchaseRequests: [],
};


describe('HomeownerRouter', () => {

    const homeownerPath = '/homeowners';

    let homeownerController: HomeownerController;

    before((done) => {
        const daos = getDaos();
        daos.then((realDaos) => {
            const homeownerDao = new MockHomeownerDao();
            const contractDao = new realDaos.SqlContractDao();
            const contractService = new MockContractService();
            homeownerController = new HomeownerController(
                homeownerDao,
                contractDao,
                contractService);
            done();
        });
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
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
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
                .catch((error) => {
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            sinon.stub(MockHomeownerDao.prototype, 'add').throws(new Error('Database query failed.'));
            callApi({ user: nextUser })
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
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
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
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
            sinon.stub(MockHomeownerDao.prototype, 'getOneByEmail').throws(new Error('Database query failed.'));
            callApi('test@gmail.com')
                .catch((error) => {
                    sinon.restore();
                    expect(error.message).to.be.equal('Database query failed.');
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
class MockHomeownerDao implements IUserDao<IPersistedHomeowner, IStorableHomeowner> {

    private examples: IPersistedHomeowner[] = Object.values(Object.assign({}, startHomeowners.users));


    constructor() {
        this.examples[0].id = 'a';
    }


    public getOne(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        if (emailOrId === 'test@gmail.com') {
            return Promise.resolve(this.examples[0]);
        } else {
            return Promise.resolve(null);
        }
    }


    public getOneByEmail(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        if (emailOrId === 'test@gmail.com') {
            return Promise.resolve(this.examples[0]);
        } else {
            return Promise.resolve(null);
        }
    }


    public getAll(): Promise<IPersistedHomeowner[]> {
        return Promise.resolve(this.examples);
    }


    public add(user: IStorableHomeowner): Promise<IPersistedHomeowner> {
        return Promise.resolve(new PersistedHomeowner());
    }


    public delete(id: string): Promise<void> {
        if (id === 'a') {
            return Promise.resolve();
        }
        throw new Error('Not found');
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockContractService implements IContractService {


    public createContract(amount: number, userId: string):
        Promise<IPersistedContract> {
        const toReturn = new PersistedContract();
        toReturn.id = 'b';
        toReturn.investments = [];
        toReturn.totalLength = 20;
        toReturn.saleAmount = amount;
        return Promise.resolve(toReturn);
    }


    public makePayment(email: string): Promise<number> {
        throw new Error('Not impl');
    }

}

function hashPwd(pwd: string) {
    return bcrypt.hashSync(pwd, pwdSaltRounds);
}
