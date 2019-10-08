import { Router } from 'express';
import InvestorRoute from './Investor';
import HomeownerRoute from './Homeowner';
import AuthRouter from './Auth';
import { IUserDao, IContractDao } from '@daos';
import {
    IPersistedHomeowner, IStoredHomeowner, IPersistedInvestor, IStoredInvestor,
    IStorableInvestor, IStorableHomeowner,
} from '@entities';
import { IContractService, IInvestmentService } from '@services';

export default (
    homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
    investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
    contractDao: IContractDao,
    contractService: IContractService,
    investmentService: IInvestmentService) => {

    // Init router and path
    const router = Router();

    // Add sub-routes
    router.use('/investors', InvestorRoute(investorDao, investmentService));
    router.use('/homeowners', HomeownerRoute(homeownerDao, investorDao, contractDao,
        contractService, investmentService));
    router.use('/auth', AuthRouter(investorDao, homeownerDao));
    return router;

};
