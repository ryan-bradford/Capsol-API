import { Router } from 'express';
import InvestorRoute from './Investor';
import HomeownerRoute from './Homeowner';
import AuthRouter from './Auth';
import { IUserDao } from '@daos';
import { IPersistedHomeowner, IStoredHomeowner, IPersistedInvestor, IStoredInvestor } from '@entities';
import { IContractService, IInvestmentService } from '@services';

export default (
    homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
    investorDao: IUserDao<IPersistedInvestor, IStoredInvestor>,
    contractService: IContractService,
    investmentService: IInvestmentService) => {

    // Init router and path
    const router = Router();

    // Add sub-routes
    router.use('/investors', InvestorRoute(investorDao, investmentService));
    router.use('/homeowners', HomeownerRoute(homeownerDao, contractService));
    router.use('/auth', AuthRouter);
    return router;

};
