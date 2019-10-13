import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import BaseRouter from './routes';

import { IUserDao, IContractDao, IInvestmentDao } from '@daos';
import {
    IPersistedHomeowner, IStoredHomeowner,
    IPersistedInvestor, IStoredInvestor, IStorableInvestor, IStorableHomeowner, IPersistedRequest, IStorableRequest,
} from '@entities';
import { IContractService, IInvestmentService, IRequestService } from '@services';
import { IRequestDao } from './daos/investment/RequestDao';

export default (
    homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
    investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
    contractDao: IContractDao,
    investmentDao: IInvestmentDao,
    requestDao: IRequestDao<IPersistedRequest, IStorableRequest>,
    createContract:
        (
            homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
            contractDao: IContractDao, requestService: IRequestService)
            => IContractService,
    createInvestment: (
        requestDao: IRequestDao<IPersistedRequest, IStorableRequest>,
        requestService: IRequestService) => IInvestmentService,
    createRequestService: (
        requestDao: IRequestDao<IPersistedRequest, IStorableRequest>,
        investorDao: IUserDao<IPersistedInvestor, IStoredInvestor>,
        homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
        investmentDao: IInvestmentDao,
        contractDao: IContractDao) => IRequestService) => {
    // Init express
    const app = express();



    // Add middleware/settings/routes to express.
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.use(express.static(path.join(__dirname, 'public')));
    const requestService = createRequestService(requestDao, investorDao,
        homeownerDao, investmentDao, contractDao);
    const contractService = createContract(homeownerDao, contractDao, requestService);
    const investmentService = createInvestment(requestDao, requestService);
    app.use('', BaseRouter(homeownerDao, investorDao, contractDao, contractService, investmentService));


    /**
     * Serve front-end content.
     */
    const viewsDir = path.join(__dirname, 'views');
    app.set('views', viewsDir);
    const staticDir = path.join(__dirname, 'public');
    app.use(express.static(staticDir));
    app.set('view engine', 'pug');

    return app;
};
