import { Router } from 'express';
import { adminMW } from '@shared';
import { container } from 'tsyringe';
import StatController from 'src/controller/Stat';


export default () => {
    const router = Router();
    const controller = container.resolve(StatController);

    /**
     * Makes a payment for every homeowner in the system.
     */
    router.get('/homeowner', (req, res, next) =>
        controller.getHomeownerStats(req, res).catch((error) => next(error)));

    return router;

};
