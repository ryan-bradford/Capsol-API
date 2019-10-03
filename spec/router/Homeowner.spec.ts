import app from '@server';
import supertest from 'supertest';

import { OK, CREATED, NOT_FOUND, BAD_REQUEST } from 'http-status-codes';
import { SuperTest, Test } from 'supertest';
import { pErr, logger } from '@shared';
import { IUserDao } from '@daos';
import { InvestmentService, IContractService } from '@services';
import { login } from 'spec/support/LoginAgent';
import { NOTFOUND } from 'dns';
import {
    IPersistedInvestor, IStoredInvestor, IPersistedHomeowner, IStoredHomeowner,
    PersistedHomeowner, IPersistedContract, PersistedContract, PersistedInvestor,
} from '@entities';

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

    let agent: SuperTest<Test>;
    let jwtCookie: string;


    beforeAll((done) => {
        agent = supertest.agent(app(
            new MockHomeownerDao(),
            new MockInvestorDao(),
            () => new MockContractService(),
            new InvestmentService()));
        login(agent, (cookie: string) => {
            logger.info(cookie);
            jwtCookie = cookie;
            done();
        });
    });

    describe(`"GET":${homeownerPath}`, () => {

        const callApi = () => {
            return agent.get(homeownerPath).set('Cookie', jwtCookie);
        };

        it('should return all users', (done) => {
            callApi()
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(OK);
                    expect(Object.values(res.body.users)).toEqual(startHomeowners.users);
                    done();
                });
        });

        it('should return a 400', (done) => {
            spyOn(MockHomeownerDao.prototype, 'getAll').and.throwError('Database query failed.');
            callApi()
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    done();
                });
        });
    });

    describe(`"POST":${homeownerPath}`, () => {

        const callApi = (body?: any) => {
            return agent.post(homeownerPath).set('Cookie', jwtCookie).send(body);
        };

        it('should allow adding a user', (done) => {
            callApi({ user: nextUser })
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(CREATED);
                    done();
                });
        });

        it('should fail if missing the user', (done) => {
            callApi()
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe('One or more of the required parameters was missing.');
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            spyOn(MockHomeownerDao.prototype, 'add').and.throwError('Database query failed.');
            callApi({ user: nextUser })
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe('Database query failed.');
                    done();
                });
        });

    });

    describe(`"DELETE":${homeownerPath}/email`, () => {

        const callApi = (email?: any) => {
            return agent.delete(`${homeownerPath}/${email}`).set('Cookie', jwtCookie).send();
        };

        it('should give information about a single user', (done) => {
            callApi('test@gmail.com')
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(OK);
                    done();
                });
        });

        it('should give 404 for not found', (done) => {
            callApi('test2@gmail.com')
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(NOT_FOUND);
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            spyOn(MockHomeownerDao.prototype, 'delete').and.throwError('Database query failed.');
            callApi('test@gmail.com')
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe('Database query failed.');
                    done();
                });
        });

    });

    describe(`"GET":${homeownerPath}/email`, () => {

        const callApi = (email?: any) => {
            return agent.get(`${homeownerPath}/${email}`).set('Cookie', jwtCookie).send();
        };

        it('should delete a single user', (done) => {
            callApi('test@gmail.com')
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(OK);
                    expect(res.body).toEqual(startHomeowners.users[0]);
                    done();
                });
        });

        it('should give 404 for not found', (done) => {
            callApi('test2@gmail.com')
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(NOT_FOUND);
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            spyOn(MockHomeownerDao.prototype, 'getOne').and.throwError('Database query failed.');
            callApi('test@gmail.com')
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe('Database query failed.');
                    done();
                });
        });

    });

    describe(`"PUT":${homeownerPath}/email/home`, () => {

        const callApi = (email?: any, amount?: any) => {
            return agent.put(`${homeownerPath}/${email}/home`).set('Cookie', jwtCookie)
                .send(amount ? { amount } : undefined);
        };

        it('should add contract for a single user', (done) => {
            callApi('test@gmail.com', 10000)
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(OK);
                    done();
                });
        });

        it('should give 404 for not found', (done) => {
            callApi('test2@gmail.com', 100)
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(NOT_FOUND);
                    done();
                });
        });

        it('should fail if the contract service fails', (done) => {
            spyOn(MockContractService.prototype, 'createContract').and.throwError('Database query failed.');
            callApi('test@gmail.com', 100)
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe('Database query failed.');
                    done();
                });
        });

        it('should fail if amount is not included', (done) => {
            callApi('test@gmail.com')
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    done();
                });
        });

    });
});

class MockInvestorDao implements IUserDao<IPersistedInvestor, IStoredInvestor> {


    public getOne(emailOrId: string | number): Promise<IPersistedInvestor | null> {
        if (emailOrId === 'test@gmail.com') {
            const loginUser = new PersistedInvestor();
            loginUser.email = 'jsmith@gmail.com';
            loginUser.pwdHash = 'hello';
            loginUser.name = 'john smith';
            return Promise.resolve(loginUser);
        } else {
            return Promise.resolve(null);
        }
    }


    public getAll(): Promise<IPersistedInvestor[]> {
        throw new Error('Not impl');
    }


    public add(user: IStoredInvestor): Promise<IPersistedInvestor> {
        throw new Error('Not impl');
    }


    public delete(id: number): Promise<void> {
        throw new Error('Not impl');
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockHomeownerDao implements IUserDao<IPersistedHomeowner, IStoredHomeowner> {

    private examples: IPersistedHomeowner[] = Object.values(Object.assign({}, startHomeowners.users));


    constructor() {
        this.examples[0].id = 1;
    }


    public getOne(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        if (emailOrId !== 'test@gmail.com') {
            return Promise.resolve(null);
        }
        return Promise.resolve(this.examples[0]);
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


    public createContract(amount: number, interestRate: number, years: number, user: IPersistedHomeowner):
        Promise<IPersistedContract> {
        const toReturn = new PersistedContract();
        toReturn.id = 5;
        toReturn.homeowner = user;
        toReturn.investments = [];
        toReturn.length = years;
        toReturn.saleAmount = amount;
        return Promise.resolve(toReturn);
    }

}

