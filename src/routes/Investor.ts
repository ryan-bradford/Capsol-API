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

    router.get('', adminMW, controller.getAll);

    router.post('', adminMW, controller.addInvestor);

    router.get('/:email', adminMW, controller.getInvestor);

    router.delete('/:email', adminMW, controller.deleteInvestor);

    router.put('/:email/investment', adminMW, controller.addInvestment);

    return router;
};
