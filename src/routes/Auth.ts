import { Request, Response, Router } from 'express';

import {
    JwtService,
} from '@shared';
import { IUserDao } from '@daos';
import { IPersistedInvestor, IPersistedHomeowner, IStorableInvestor, IStorableHomeowner } from '@entities';
import AuthController from 'src/controller/Auth';

export default (
    investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
    homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>) => {
    const router = Router();
    const controller = new AuthController(investorDao, homeownerDao);
    /******************************************************************************
     *                      Login User - "POST /api/auth/login"
     ******************************************************************************/
    router.post('/login', (req, res) => controller.login(req, res));


    /******************************************************************************
     *                      Logout - "GET /api/auth/logout"
     ******************************************************************************/
    router.post('/logout', controller.logout);


    /******************************************************************************
     *                                 Export Router
     ******************************************************************************/

    return router;

};
