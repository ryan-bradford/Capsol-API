import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import BaseRouter from './routes';

import { IUserDao, IContractDao, IInvestmentDao } from '@daos';
import {
    IPersistedHomeowner, IStoredHomeowner,
    IPersistedInvestor, IStoredInvestor, IPersistedSellRequest,
    IStorableSellRequest, IPersistedPurchaseRequest, IStorablePurchaseRequest, IStorableInvestor, IStorableHomeowner,
} from '@entities';
import { IContractService, IInvestmentService, InvestmentService, IRequestService } from '@services';
import { IRequestDao } from './daos/investment/RequestDao';

export default (
    homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
    investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
    contractDao: IContractDao,
    investmentDao: IInvestmentDao,
    sellRequestDao: IRequestDao<IPersistedSellRequest, IStorableSellRequest>,
    purchaseRequestDao: IRequestDao<IPersistedPurchaseRequest, IStorablePurchaseRequest>,
    createContract:
        (
            homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
            contractDao: IContractDao, requestService: IRequestService)
            => IContractService,
    createInvestment: (
        purchaseRequestDao: IRequestDao<IPersistedPurchaseRequest, IStorablePurchaseRequest>,
        sellRequestDao: IRequestDao<IPersistedSellRequest, IStorableSellRequest>,
        requestService: IRequestService) => IInvestmentService,
    createRequestService: (
        sellRequestDao: IRequestDao<IPersistedSellRequest, IStorableSellRequest>,
        purchaseRequestDao: IRequestDao<IPersistedPurchaseRequest, IStorablePurchaseRequest>,
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
    const requestService = createRequestService(sellRequestDao, purchaseRequestDao, investorDao,
        homeownerDao, investmentDao, contractDao);
    const contractService = createContract(homeownerDao, contractDao, requestService);
    const investmentService = createInvestment(purchaseRequestDao, sellRequestDao, requestService);
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
