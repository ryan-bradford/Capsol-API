import { Router } from 'express';
import { adminMW } from '@shared';
import { container } from 'tsyringe';
import { EstimateController } from '@controller';


export default () => {
    const router = Router();
    const controller = container.resolve(EstimateController);

    /**
     * Gives an estimate for a homeowner signing up.
     */
    router.get('/homeowner', (req, res, next) =>
        controller.getHomeownerEstimate(req, res).catch((error) => next(error)));


    /**
     * Gives an estimate for an investor signing up.
     */
    router.get('/investor', (req, res, next) =>
        controller.getInvestorEstimate(req, res).catch((error) => next(error)));

    return router;

};
