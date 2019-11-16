import { IUserDao } from '../daos/user/UserDao';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { IPersistedInvestor, IPersistedHomeowner, IStorableInvestor, IStorableHomeowner } from '@entities';
import { BAD_REQUEST, UNAUTHORIZED, OK } from 'http-status-codes';
import {
    paramMissingError,
    loginFailedErr,
    jwtCookieProps,
    JwtService,
} from '@shared';
import { injectable, inject } from 'tsyringe';

@injectable()
export default class AuthController {

    private jwtService = new JwtService();


    /**
     * Creates a `AuthController` using the given investorDao and homeownerDao.
     */
    constructor(
        @inject('InvestorDao') private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        @inject('HomeownerDao') private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>) {
    }


    /**
     * Logs a user in given email and password in the request body.
     * Outputs the cookie response in the given res.
     */
    public async login(req: Request, res: Response) {
        // Check email and password present
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(BAD_REQUEST).json({
                error: paramMissingError,
            });
        }
        // Fetch user
        const homeowner = await this.homeownerDao.getOneByEmail(email);
        const investor = await this.investorDao.getOneByEmail(email);
        const user = homeowner ? homeowner : investor;
        if (!user) {
            return res.status(UNAUTHORIZED).json({
                error: loginFailedErr,
            });
        }
        // Check password
        const pwdPassed = await bcrypt.compare(password, user.pwdHash);
        if (!pwdPassed) {
            return res.status(UNAUTHORIZED).json({
                error: loginFailedErr,
            });
        }
        // Setup Admin Cookie
        const jwt = await this.jwtService.getJwt({
            role: 1, // TODO: FIX
        });
        const { key, options } = jwtCookieProps;
        res.cookie(key, jwt, options);
        // Return
        return res.status(OK).end();
    }


    /**
     * Logs the user out whose JWT in stored in the given res.
     */
    public async logout(req: Request, res: Response) {
        const { key, options } = jwtCookieProps;
        res.clearCookie(key, options);
        return res.status(OK).end();
    }
}
