import { IUserDao } from 'src/daos/user/UserDao';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { IPersistedInvestor, IStoredInvestor, IPersistedHomeowner, IStoredHomeowner } from '@entities';
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
        private investorDao: IUserDao<IPersistedInvestor, IStoredInvestor>,
        private homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>) { }


    public async login(req: Request, res: Response) {
        try {
            // Check email and password present
            const { email, password } = req.body;
            if (!(email && password)) {
                return res.status(BAD_REQUEST).json({
                    error: paramMissingError,
                });
            }
            // Fetch user
            logger.info(email);
            const homeowner = await this.homeownerDao.getOne(email);
            const investor = await this.investorDao.getOne(email);
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
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    }


    public async logout(req: Request, res: Response) {
        try {
            const { key, options } = jwtCookieProps;
            res.clearCookie(key, options);
            return res.status(OK).end();
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    }
}
