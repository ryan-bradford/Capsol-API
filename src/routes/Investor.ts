import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, NOT_FOUND } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { adminMW, logger, paramMissingError } from '@shared';
import { IUserDao } from '@daos';
import { IInvestmentService } from '@services';
import { IPersistedInvestor, IStoredInvestor } from '@entities';
import InvestorController from 'src/controller/Investor';


// Init shared
export default (investorDao: IUserDao<IPersistedInvestor, IStoredInvestor>, investmentService: IInvestmentService) => {
    const router = Router();
    const controller = new InvestorController(investorDao, investmentService);

    router.get('', adminMW, (req, res) => controller.getAll(req, res));

    router.post('', adminMW, (req, res) => controller.addInvestor(req, res));

    router.get('/:email', adminMW, (req, res) => controller.getInvestor(req, res));

    router.delete('/:email', adminMW, (req, res) => controller.deleteInvestor(req, res));

    router.put('/:email/investment', adminMW, (req, res) => controller.addInvestment(req, res));

    return router;
};
