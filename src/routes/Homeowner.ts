import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, NOT_FOUND } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { adminMW, logger, paramMissingError } from '@shared';
import { IUserDao, IContractDao } from '@daos';
import { IContractService, IInvestmentService } from '@services';
import { NOTFOUND } from 'dns';
import { IPersistedHomeowner, IStoredHomeowner, IPersistedInvestor, IStorableInvestor } from '@entities';
import HomeownerController from 'src/controller/Homeowner';


export default (
    homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>,
    investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
    contractDao: IContractDao,
    contractService: IContractService,
    investmentService: IInvestmentService) => {
    const router = Router();
    const controller = new HomeownerController(homeownerDao, investorDao, contractDao,
        contractService, investmentService);

    router.get('', adminMW, controller.getUsers);

    router.post('', adminMW, controller.addUser);

    router.get('/:email', adminMW, controller.getUser);

    router.delete('/:email', adminMW, controller.deleteUser);

    router.put('/:email/home', adminMW, controller.signUpHome);

    router.put('/:email/payment', adminMW, controller.makePayment);

    return router;

};
