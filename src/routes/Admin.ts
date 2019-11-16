import { Router } from 'express';
import { adminMW } from '@shared';
import { container } from 'tsyringe';
import { AdminController } from '@controller';


export default () => {
    const router = Router();
    const controller = container.resolve(AdminController);

    /**
     * Makes a payment for every homeowner in the system.
     */
    router.post('/payments', adminMW, (req, res, next) =>
        controller.makeAllPayments(req, res).catch((error) => next(error)));

    /**
     * Matches all added funds and monthly payments with contracts and investments for sale,
     */
    router.post('/update', adminMW, (req, res, next) =>
        controller.handleInvestments(req, res).catch((error) => next(error)));

    return router;

};
