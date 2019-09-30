import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import BaseRouter from './routes';
import { createConnection } from 'typeorm';

import { IUserDao } from '@daos';
import { IHomeowner, IInvestor, User } from '@entities';
import { logger as loggerOutput } from '@shared';
import { IContractService, IInvestmentService } from '@services';

export default (
    homeownerDao: IUserDao<IHomeowner>,
    investorDao: IUserDao<IInvestor>,
    createContract: (homeownerDao: IUserDao<IHomeowner>) => IContractService,
    investmentService: IInvestmentService) => {
    // Init express
    const app = express();

    const contractService = createContract(homeownerDao);


    // Add middleware/settings/routes to express.
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('', BaseRouter(homeownerDao, investorDao, contractService, investmentService));


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
