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

    router.get('', adminMW, (req, res) => controller.getUsers(req, res));

    router.post('', adminMW, (req, res) => controller.addUser(req, res));

    router.get('/:email', adminMW, (req, res) => controller.getUser(req, res));

    router.delete('/:email', adminMW, (req, res) => controller.deleteUser(req, res));

    router.put('/:email/home', adminMW, (req, res) => controller.signUpHome(req, res));

    router.put('/:email/payment', adminMW, (req, res) => controller.makePayment(req, res));

    return router;

};
