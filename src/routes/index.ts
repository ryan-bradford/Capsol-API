import { Router, NextFunction, Response, Request } from 'express';
import InvestorRoute from './Investor';
import HomeownerRoute from './Homeowner';
import AuthRouter from './Auth';
import { logger } from '@shared';
import { AssertionError } from 'assert';
import { ClientError } from 'src/shared/error/ClientError';
import { NotFoundError } from 'src/shared/error/NotFound';

export default () => {

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
    router.use('/investor', InvestorRoute());
    router.use('/homeowner', HomeownerRoute());
    router.use('/auth', AuthRouter());
    router.use(ClientErrorMiddleware);
    router.use(ServerErrorMiddleware);
    return router;

};

function ClientErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
    if ((error as ClientError).type === ClientError.type) {
        response.status(400).send(error.message);
    } else if ((error as NotFoundError).type === NotFoundError.type) {
        response.status(404).send(error.message);
    }
    next(error);
}

function ServerErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
    logger.error(error.message);
    response.status(500).send();
}
