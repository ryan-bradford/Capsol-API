import app from '@server';
import supertest from 'supertest';

import { OK, CREATED } from 'http-status-codes';
import { SuperTest, Test } from 'supertest';
import { UserRoles, Investor, IHomeowner, IInvestor, IContract } from '@entities';
import { pErr, logger } from '@shared';
import { IUserDao } from '@daos';
import { InvestmentService, IContractService } from '@services';
import { login } from 'spec/support/LoginAgent';

const startHomeowners = {
    users: [
        {
            name: 'Ryan',
            email: 'test@gmail.com',
            pwdHash: '1',
            role: UserRoles.Homeowner,
            purchaseRequests: [],
        },
    ],
};

const nextUser = {
    name: 'Emma',
    email: 'blorg@gmail.com',
    pwdHash: '2',
    role: UserRoles.Homeowner,
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
                    expect(res.status).toBe(400);
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
                    expect(res.status).toBe(400);
                    expect(res.body.error).toBe('One or more of the required parameters was missing.');
                    done();
                });
        });

        it('should fail if the DB fails', (done) => {
            spyOn(MockHomeownerDao.prototype, 'add').and.throwError('Database query failed.');
            callApi({ user: nextUser })
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(400);
                    expect(res.body.error).toBe('Database query failed.');
                    done();
                });
        });

    });
});

class MockInvestorDao implements IUserDao<IInvestor> {


    public getOne(emailOrId: string | number): Promise<IInvestor | null> {
        if (emailOrId === 'jsmith@gmail.com') {
            const loginUser = new Investor();
            loginUser.email = 'jsmith@gmail.com';
            loginUser.role = UserRoles.Investor;
            loginUser.pwdHash = 'hello';
            loginUser.name = 'john smith';
            return Promise.resolve(loginUser);
        } else {
            return Promise.resolve(null);
        }
    }


    public getAll(): Promise<IInvestor[]> {
        throw new Error('Not impl');
    }


    public add(user: IInvestor): Promise<IInvestor> {
        throw new Error('Not impl');
    }


    public delete(email: string): Promise<void> {
        throw new Error('Not impl');
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockHomeownerDao implements IUserDao<IHomeowner> {

    private examples: IHomeowner[] = Object.values(Object.assign({}, startHomeowners.users));


    public getOne(emailOrId: string | number): Promise<IHomeowner | null> {
        if (emailOrId !== 'test@gmail.com') {
            return Promise.resolve(null);
        }
        return Promise.resolve(this.examples[0]);
    }


    public getAll(): Promise<IHomeowner[]> {
        return Promise.resolve(this.examples);
    }


    public add(user: IHomeowner): Promise<IHomeowner> {
        return Promise.resolve(user);
    }


    public delete(email: string): Promise<void> {
        return Promise.resolve();
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockContractService implements IContractService {


    public createContract(amount: number, interestRate: number, years: number, userId: number): Promise<IContract> {
        throw new Error('Method not implemented.');
    }

}

