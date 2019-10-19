import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, NOT_FOUND } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { adminMW, logger, paramMissingError } from '@shared';
import { IUserDao } from '@daos';
import { IInvestmentService, IRequestService } from '@services';
import { IPersistedInvestor, IStoredInvestor, IStorableInvestor } from '@entities';
import InvestorController from 'src/controller/Investor';


// Init shared
export default (
    investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
    investmentService: IInvestmentService,
    requestService: IRequestService) => {
    const router = Router();
    const controller = new InvestorController(investorDao, investmentService, requestService);

    router.get('', adminMW, (req, res) => controller.getAll(req, res));

    router.post('', (req, res) => controller.addInvestor(req, res));

    router.post('/update', adminMW, (req, res) => controller.handleInvestments(req, res));

    router.get('/:email', adminMW, (req, res) => controller.getInvestor(req, res));

    router.delete('/:email', adminMW, (req, res) => controller.deleteInvestor(req, res));

    router.put('/:email/investment', adminMW, (req, res) => controller.addInvestment(req, res));

    return router;
};
