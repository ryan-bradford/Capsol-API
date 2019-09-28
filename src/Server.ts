import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import BaseRouter from './routes';

import { SqlHomeownerDao } from './dao';
import { ContractService } from '@daos';


// Init express
const app = express();

const homeownerDao = new SqlHomeownerDao();
const contractService = new ContractService(homeownerDao);


// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));
app.use('', BaseRouter(homeownerDao, contractService));


/**
 * Serve front-end content.
 */
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
app.set('view engine', 'pug');


// Export express instance
export default app;
