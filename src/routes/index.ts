import { Router, NextFunction, Response, Request } from 'express';
import InvestorRoute from './Investor';
import HomeownerRoute from './Homeowner';
import AuthRouter from './Auth';
import { IUserDao, IContractDao } from '@daos';
import {
    IPersistedHomeowner, IStoredHomeowner, IPersistedInvestor, IStoredInvestor,
    IStorableInvestor, IStorableHomeowner,
} from '@entities';
import { IContractService, IInvestmentService, IRequestService } from '@services';
import { logger } from '@shared';
import { AssertionError } from 'assert';

export default (
    homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
    investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
    contractDao: IContractDao,
    contractService: IContractService,
    investmentService: IInvestmentService,
    requestService: IRequestService) => {

    // Init router and path
    const router = Router();

    // Enabling CORS
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
        next();
    });

    // Add sub-routes
    router.use('/investor', InvestorRoute(investorDao, investmentService, requestService));
    router.use('/homeowner', HomeownerRoute(homeownerDao, investorDao, contractDao,
        contractService, investmentService));
    router.use('/auth', AuthRouter(investorDao, homeownerDao));
    router.use(ClientErrorMiddleware);
    router.use(ServerErrorMiddleware);
    return router;

};

function ClientErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
    if ((error as AssertionError).actual !== undefined) {
        next(error);
    } else {
        response.status(400).send(error.message);
    }
}

function ServerErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
    logger.error(error.message);
    response.status(500).send();
}
