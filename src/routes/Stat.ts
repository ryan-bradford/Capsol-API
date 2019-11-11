import { Router } from 'express';
import { adminMW } from '@shared';
import { container } from 'tsyringe';
import StatController from 'src/controller/Stat';


export default () => {
    const router = Router();
    const controller = container.resolve(StatController);

    /**
     * Gives the stats that are important to a homeowner
     */
    router.get('/homeowner', (req, res, next) =>
        controller.getHomeownerStats(req, res).catch((error) => next(error)));

    /**
     * Gives the stats that are important to an investor
     */
    router.get('/investor', (req, res, next) =>
        controller.getInvestorStat(req, res).catch((error) => next(error)));

    /**
     * Gives the stats that are important to an investor
     */
    router.get('/investor/performance', (req, res, next) =>
        controller.getHistoricalPerformance(req, res).catch((error) => next(error)));

    return router;

};
