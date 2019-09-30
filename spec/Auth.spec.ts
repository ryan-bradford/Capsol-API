import app from '@server';
import supertest from 'supertest';
import bcrypt from 'bcrypt';

import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from 'http-status-codes';
import { Response, SuperTest, Test } from 'supertest';
import { IUser, User, UserRoles, Investor, IHomeowner, Homeowner, IInvestor } from '@entities';
import { pErr, pwdSaltRounds, jwtCookieProps, loginFailedErr } from '@shared';
import { SqlHomeownerDao, IUserDao } from '@daos';
import HomeownerRoute from 'src/routes/Homeowner';
import { ContractService, InvestmentService } from '@services';


describe('UserRouter', () => {

    const authPath = '/auth';
    const loginPath = `${authPath}/login`;
    const logoutPath = `${authPath}/logout`;

    let agent: SuperTest<Test>;


    beforeAll((done) => {
        agent = supertest.agent(app(
            new MockHomeownerDao(),
            new MockInvestorDao(),
            (homeownerDao) => new ContractService(homeownerDao),
            new InvestmentService()));
        done();
    });


    describe(`"POST:${loginPath}"`, () => {

        const callApi = (reqBody: object) => {
            return agent.post(loginPath).type('form').send(reqBody);
        };


        it(`should return a response with a status of ${OK} and a cookie with a jwt if the login
            was successful.`, (done) => {
            // Setup Dummy Data
            const creds = {
                email: 'jsmith@gmail.com',
                password: 'Password@1',
            };
            const role = UserRoles.Investor;
            const pwdHash = hashPwd(creds.password);
            const loginUser = new Investor('john smith', creds.email, role, pwdHash);
            spyOn(SqlHomeownerDao.prototype, 'getOne').and.returnValue(Promise.resolve(loginUser));
            // Call API
            callApi(creds)
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(OK);
                    expect(res.headers['set-cookie'][0]).toContain(jwtCookieProps.key);
                    done();
                });
        });


        it(`should return a response with a status of ${UNAUTHORIZED} and a json with the error
            "${loginFailedErr}" if the email was not found.`, (done) => {
            // Setup Dummy Data
            const creds = {
                email: 'jsmith@gmail.com',
                password: 'Password@1',
            };
            spyOn(SqlHomeownerDao.prototype, 'getOne').and.returnValue(Promise.resolve(null));
            // Call API
            callApi(creds)
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(UNAUTHORIZED);
                    expect(res.body.error).toBe(loginFailedErr);
                    done();
                });
        });


        it(`should return a response with a status of ${UNAUTHORIZED} and a json with the error
            "${loginFailedErr}" if the password failed.`, (done) => {
            // Setup Dummy Data
            const creds = {
                email: 'jsmith@gmail.com',
                password: 'someBadPassword',
            };
            const role = UserRoles.Homeowner;
            const pwdHash = hashPwd('Password@1');
            const loginUser = new Investor('john smith', creds.email, role, pwdHash);
            spyOn(SqlHomeownerDao.prototype, 'getOne').and.returnValue(Promise.resolve(loginUser));
            // Call API
            callApi(creds)
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(UNAUTHORIZED);
                    expect(res.body.error).toBe(loginFailedErr);
                    done();
                });
        });


        it(`should return a response with a status of ${BAD_REQUEST} and a json with an error
            for all other bad responses.`, (done) => {
            // Setup Dummy Data
            const creds = {
                email: 'jsmith@gmail.com',
                password: 'someBadPassword',
            };
            spyOn(SqlHomeownerDao.prototype, 'getOne').and.throwError('Database query failed.');
            // Call API
            callApi(creds)
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBeTruthy();
                    done();
                });
        });
    });


    describe(`"GET:${logoutPath}"`, () => {


        it(`should return a response with a status of ${OK}.`, (done) => {
            agent.get(logoutPath)
                .end((err: Error, res: any) => {
                    pErr(err);
                    expect(res.status).toBe(OK);
                    done();
                });
        });
    });


    function hashPwd(pwd: string) {
        return bcrypt.hashSync(pwd, pwdSaltRounds);
    }
});

class MockInvestorDao implements IUserDao<IInvestor> {


    public getOne(emailOrId: string | number): Promise<IInvestor | null> {
        if (emailOrId === 'jsmith@gmail.com') {
            return Promise.resolve(new Investor('john smith', 'jsmith@gmail.com', UserRoles.Investor, 'hello'));
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


    public getOne(emailOrId: string | number): Promise<IHomeowner | null> {
        return Promise.resolve(null);
    }


    public getAll(): Promise<IHomeowner[]> {
        throw new Error('Not impl');
    }


    public add(user: IHomeowner): Promise<IHomeowner> {
        throw new Error('Not impl');
    }


    public delete(email: string): Promise<void> {
        throw new Error('Not impl');
    }

}



