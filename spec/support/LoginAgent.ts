import bcrypt from 'bcrypt';
import { SuperTest, Test } from 'supertest';
import { pwdSaltRounds } from '@shared';
import { SqlHomeownerDao } from '@daos';
import { IStoredHomeowner, IPersistedHomeowner } from '@entities';


const creds = {
    email: 'jsmith@gmail.com',
    password: 'Password@1',
};

export const login = (beforeAgent: SuperTest<Test>, done: any) => {
    // Setup dummy data
    const pwdHash = bcrypt.hashSync(creds.password, pwdSaltRounds);
    const loginUser: IPersistedHomeowner = {
        id: 1,
        name: 'john smith',
        email: creds.email,
        admin: true,
        pwdHash,
        purchaseRequests: [],
    };
    spyOn(SqlHomeownerDao.prototype, 'getOne').and.returnValue(Promise.resolve(loginUser));
    // Call Login API
    beforeAgent
        .post('/auth/login')
        .type('form')
        .send(creds)
        .end((err: Error, res: any) => {
            if (err) {
                throw err;
            }
            done(res.headers['set-cookie']);
        });
};
