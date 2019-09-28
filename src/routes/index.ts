import { Router } from 'express';
import InvestorRoute from './Investor';
import HomeownerRoute from './Homeowner';
import AuthRouter from './Auth';
import { IUserDao } from 'src/dao';
import { IHomeowner } from '@entities';
import { IContractService } from 'src/services/Investment/ContractService';

export default (homeownerDao: IUserDao<IHomeowner>, contractService: IContractService) => {

    // Init router and path
    const router = Router();

    // Add sub-routes
    router.use('/investors', InvestorRoute);
    router.use('/homeowners', HomeownerRoute(homeownerDao, contractService));
    router.use('/auth', AuthRouter);
    return router;

};
