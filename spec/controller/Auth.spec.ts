import { expect } from 'chai';
import bcrypt from 'bcrypt';
import { Response } from 'express';

import { BAD_REQUEST, OK, UNAUTHORIZED } from 'http-status-codes';
import {
    IPersistedInvestor, PersistedInvestor, IPersistedHomeowner,
    IStorableInvestor, IStorableHomeowner,
} from '@entities';
import { pwdSaltRounds, jwtCookieProps, loginFailedErr } from '@shared';
import { IUserDao } from '@daos';
import { mockRequest, mockResponse, ResponseOutput } from 'mock-req-res';
import AuthController from 'src/controller/Auth';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);


describe('AuthRouter', () => {

    const authPath = '/auth';
    const loginPath = `${authPath}/login`;

    let router: AuthController;
    before(() => {
        router = new AuthController(new MockInvestorDao(), new MockHomeownerDao());
    });

    describe(`"POST:${loginPath}"`, () => {

        const callApi = async (reqBody: object): Promise<ResponseOutput> => {
            const res = mockResponse();
            const req = mockRequest({ body: reqBody });
            await router.login(req as any, res as any);
            return res;
        };


        it(`should return a response with a status of ${OK} and a cookie with a jwt if the login
            was successful.`, (done) => {
            // Setup Dummy Data
            const creds = {
                email: 'jsmith@gmail.com',
                password: 'Password@1',
            };
            // Call API
            callApi(creds).then((res) => {
                expect(res.status).to.be.calledWith(OK);
                expect(res.cookie.calledWith(jwtCookieProps.key, jwtCookieProps.key, jwtCookieProps.options));
                done();
            });
        });


        it(`should return a response with a status of ${UNAUTHORIZED} and a json with the error
            "${loginFailedErr}" if the email was not found.`, (done) => {
            // Setup Dummy Data
            const creds = {
                email: 'askjnd@gmail.com',
                password: 'Password@1',
            };
            // Call API
            callApi(creds)
                .then((res) => {
                    expect(res.status).to.be.calledWith(UNAUTHORIZED);
                    expect(res.json).to.be.calledWith({ error: loginFailedErr });
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
            // Call API
            callApi(creds)
                .then((res) => {
                    expect(res.status).to.be.calledWith(UNAUTHORIZED);
                    expect(res.json).to.be.calledWith({ error: loginFailedErr });
                    done();
                });
        });


        it(`should return a response with a status of ${BAD_REQUEST} and a json with an error
            for all other bad responses.`, (done) => {
            // Setup Dummy Data
            const creds = {
                email: '3@gmail.com',
                password: 'someBadPassword',
            };
            // Call API
            callApi(creds)
                .catch((error) => {
                    expect(error.message).to.be.equal('Database query failed.');
                    done();
                });
        });
    });
});

class MockInvestorDao implements IUserDao<IPersistedInvestor, IStorableInvestor> {


    public getOneByEmail(emailOrId: string): Promise<IPersistedInvestor | null> {
        if (emailOrId === '3@gmail.com') {
            throw new Error('Database query failed.');
        } else if (emailOrId === 'jsmith@gmail.com') {
            const loginUser = new PersistedInvestor();
            loginUser.email = 'jsmith@gmail.com';
            loginUser.pwdHash = hashPwd('Password@1');
            loginUser.name = 'john smith';
            return Promise.resolve(loginUser);
        } else {
            return Promise.resolve(null);
        }
    }


    public getOne(email: string): Promise<IPersistedInvestor | null> {
        return Promise.resolve(null);
    }


    public getAll(): Promise<IPersistedInvestor[]> {
        throw new Error('Not impl');
    }


    public add(user: IStorableInvestor): Promise<IPersistedInvestor> {
        throw new Error('Not impl');
    }


    public delete(id: string): Promise<void> {
        throw new Error('Not impl');
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockHomeownerDao implements IUserDao<IPersistedHomeowner, IStorableHomeowner> {


    public getOne(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        return Promise.resolve(null);
    }


    public getOneByEmail(emailOrId: string | number): Promise<IPersistedHomeowner | null> {
        return Promise.resolve(null);
    }


    public getAll(): Promise<IPersistedHomeowner[]> {
        throw new Error('Not impl');
    }


    public add(user: IStorableHomeowner): Promise<IPersistedHomeowner> {
        throw new Error('Not impl');
    }


    public delete(id: string): Promise<void> {
        throw new Error('Not impl');
    }

}
function hashPwd(pwd: string) {
    return bcrypt.hashSync(pwd, pwdSaltRounds);
}
