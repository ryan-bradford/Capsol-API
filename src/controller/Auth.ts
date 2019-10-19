import { IUserDao } from 'src/daos/user/UserDao';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { IPersistedInvestor, IPersistedHomeowner, IStorableInvestor, IStorableHomeowner } from '@entities';
import { BAD_REQUEST, UNAUTHORIZED, OK } from 'http-status-codes';
import {
    paramMissingError,
    loginFailedErr,
    logger,
    jwtCookieProps,
    JwtService,
} from '@shared';

export default class AuthController {

    private jwtService = new JwtService();


    constructor(
        private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>) { }


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
            role: user.admin ? 1 : 0,
        });
        const { key, options } = jwtCookieProps;
        res.cookie(key, jwt, options);
        // Return
        return res.status(OK).end();
    }


    public async logout(req: Request, res: Response) {
        const { key, options } = jwtCookieProps;
        res.clearCookie(key, options);
        return res.status(OK).end();
    }
}
