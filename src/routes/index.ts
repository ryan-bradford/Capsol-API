import { Router, NextFunction, Response, Request } from 'express';
import InvestorRoute from './Investor';
import HomeownerRoute from './Homeowner';
import AuthRouter from './Auth';
import AdminRouter from './Admin';
import StatRouter from './Stat';
import EstimateRouter from './Estimate';
import { logger } from '@shared';
import { ClientError } from '../shared/error/ClientError';
import { NotFoundError } from '../shared/error/NotFound';

export default () => {

    // Init router and path
    const router = Router();

    // Enabling CORS
    router.use((req, res, next) => {
        const origin = req.headers.origin;
        res.setHeader('Access-Control-Allow-Origin', String(origin));
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
        next();
    });

    // Add sub-routes
    router.use('/investor', InvestorRoute());
    router.use('/homeowner', HomeownerRoute());
    router.use('/auth', AuthRouter());
    router.use('/admin', AdminRouter());
    router.use('/estimate', EstimateRouter());
    router.use('/stat', StatRouter());
    router.use(ClientErrorMiddleware);
    router.use(ServerErrorMiddleware);
    return router;

};

function ClientErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
    logger.info(error.message);
    if ((error as ClientError).type === ClientError.type) {
        return response.status(400).send(error.message);
    } else if ((error as NotFoundError).type === NotFoundError.type) {
        return response.status(404).send(error.message);
    }
    next(error);
}

function ServerErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
    logger.error(error.message);
    return response.status(500).send();
}
