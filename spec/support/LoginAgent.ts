import bcrypt from 'bcrypt';
import { SuperTest, Test } from 'supertest';
import { UserRoles, IHomeowner } from '@entities';
import { pwdSaltRounds } from '@shared';
import { SqlHomeownerDao } from '@daos';


const creds = {
    email: 'jsmith@gmail.com',
    password: 'Password@1',
};

export const login = (beforeAgent: SuperTest<Test>, done: any) => {
    // Setup dummy data
    const role = UserRoles.Admin;
    const pwdHash = bcrypt.hashSync(creds.password, pwdSaltRounds);
    const loginUser: IHomeowner = {
        name: 'john smith',
        email: creds.email,
        role,
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
