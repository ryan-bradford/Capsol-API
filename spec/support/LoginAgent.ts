import { SuperTest, Test } from 'supertest';

const creds = {
    email: 'login@gmail.com',
    password: 'Password@1',
};

export const login = (
    beforeAgent: SuperTest<Test>, done: any) => {
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
