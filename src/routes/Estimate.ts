import { Router } from 'express';
import { adminMW } from '@shared';
import { container } from 'tsyringe';
import EstimateController from 'src/controller/Estimate';


export default () => {
    const router = Router();
    const controller = container.resolve(EstimateController);

    /**
     * Makes a payment for every homeowner in the system.
     */
    router.get('/homeowner', (req, res, next) =>
        controller.getHomeownerEstimate(req, res).catch((error) => next(error)));

    return router;

};
