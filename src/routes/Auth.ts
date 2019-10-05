import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK, UNAUTHORIZED } from 'http-status-codes';

import {
    paramMissingError,
    loginFailedErr,
    logger,
    jwtCookieProps,
    JwtService,
} from '@shared';
import { IUserDao } from '@daos';
import { IPersistedInvestor, IStoredInvestor, IPersistedHomeowner, IStoredHomeowner } from '@entities';
import AuthController from 'src/controller/Auth';

export default (
    investorDao: IUserDao<IPersistedInvestor, IStoredInvestor>,
    homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>) => {
    const router = Router();
    const jwtService = new JwtService();
    const controller = new AuthController(investorDao, homeownerDao);
    /******************************************************************************
     *                      Login User - "POST /api/auth/login"
     ******************************************************************************/
    router.post('/login', controller.login);

    /******************************************************************************
     *                      Login - "GET /api/auth/login"
     ******************************************************************************/
    router.get('/login', async (req: Request, res: Response) => {
        res.render('login');
    });



    /******************************************************************************
     *                      Logout - "GET /api/auth/logout"
     ******************************************************************************/
    router.get('/logout', controller.logout);


    /******************************************************************************
     *                                 Export Router
     ******************************************************************************/

    return router;

};
