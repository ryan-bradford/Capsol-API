import { JwtService, adminMW, userMW } from '@shared';
import { mockRequest, mockResponse } from 'mock-req-res';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('Testing JWT/Auth Services', () => {

    const jwtService = new JwtService();
    let adminJWT: string;
    let ryanJWT: string;
    let josieJWT: string;

    it('should create the JWT', (done) => {
        Promise.all([jwtService.getJwt({
            role: 1,
            email: 'lucy@gmail.com',
        }),
        jwtService.getJwt({
            role: 0,
            email: 'ryan@gmail.com',
        }),
        jwtService.getJwt({
            role: 0,
            email: 'josie@gmail.com',
        })]).then(([admin, ryan, josie]) => {
            adminJWT = admin;
            ryanJWT = ryan;
            josieJWT = josie;
            done();
        });
    });

    it('should let admin access admin endpoints', (done) => {
        const res = mockResponse();
        adminMW(mockRequest({
            signedCookies: { JwtCookieKey: adminJWT },
        }), res, (err) => 1).then((result) => {
            expect(result).to.be.equal(1);
            done();
        });
    });

    it('should not let non-admin access admin endpoints', (done) => {
        const res = mockResponse();
        adminMW(mockRequest({
            signedCookies: { JwtCookieKey: ryanJWT },
        }), res, (err) => 1).then((result) => {
            expect(result).to.not.be.equal(1);
            expect(res.status).to.be.calledWith(401);
            done();
        });
    });

    it('should let a user go to their endpoint', (done) => {
        const res = mockResponse();
        userMW(mockRequest({
            signedCookies: { JwtCookieKey: ryanJWT },
            params: { email: 'ryan@gmail.com' },
        }), res, (err) => 1).then((result) => {
            expect(result).to.be.equal(1);
            done();
        });
    });

    it('should let a admin access anyones endpoint', (done) => {
        const res = mockResponse();
        userMW(mockRequest({
            signedCookies: { JwtCookieKey: adminJWT },
            params: { email: 'ryan@gmail.com' },
        }), res, (err) => 1).then((result) => {
            expect(result).to.be.equal(1);
            done();
        });
    });

    it('should not let a user access someone elses endpoint', (done) => {
        const res = mockResponse();
        userMW(mockRequest({
            signedCookies: { JwtCookieKey: josieJWT },
            params: { email: 'ryan@gmail.com' },
        }), res, (err) => 1).then((result) => {
            expect(result).to.not.be.equal(1);
            expect(res.status).to.be.calledWith(401);
            done();
        });
    });
});
