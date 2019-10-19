import { Request, Response } from 'express';
import { IUserDao, IContractDao } from '@daos';
import { IPersistedHomeowner, IPersistedInvestor, IStorableInvestor, IStorableHomeowner } from '@entities';
import { IContractService, IInvestmentService } from '@services';
import { OK, CREATED, NOT_FOUND } from 'http-status-codes';
import { logger, paramMissingError } from '@shared';
import { ParamsDictionary } from 'express-serve-static-core';

export default class HomeownerController {
    constructor(
        private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
        private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        private contractDao: IContractDao,
        private contractService: IContractService,
        private investmentService: IInvestmentService) { }


    public async getUsers(req: Request, res: Response) {
        const users = await this.homeownerDao.getAll();
        return res.status(OK).json({ users });
    }


    public async addUser(req: Request, res: Response) {
        // Check parameters
        const { user } = req.body;
        logger.info(JSON.stringify(user.name));
        if (!user) {
            throw new Error(paramMissingError);
        }
        // Add new user
        await this.homeownerDao.add(user);
        return res.status(CREATED).send(user);
    }


    public async getUser(req: Request, res: Response) {
        const { email } = req.params;
        const user = await this.homeownerDao.getOneByEmail(email);
        if (user) {
            return res.status(OK).json(user);
        } else {
            return res.status(NOT_FOUND).end();
        }
    }


    public async deleteUser(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        const homeowner = await this.homeownerDao.getOneByEmail(email);
        if (!homeowner || !homeowner.id) {
            return res.status(NOT_FOUND).end();
        }
        await this.homeownerDao.delete(homeowner.id);
        return res.status(OK).end();
    }


    public async signUpHome(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        const { amount } = req.body;
        if (!amount && !(typeof amount === 'number')) {
            throw new Error('Bad amount');
        }
        const user = await this.homeownerDao.getOneByEmail(email);
        if (user && user.id) {
            await this.contractService.createContract(amount, user.id);
            return res.status(OK).end();
        } else {
            return res.status(NOT_FOUND).end();
        }
    }


    public async makePayment(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        const payment = await this.contractService.makePayment(email);
        if (payment === null) {
            return res.status(203).end();
        }
        return res.status(OK).send({ payment });
    }


    public async makeAllPayments(req: Request, res: Response) {
        const allContracts = await this.contractDao.getContracts();
        allContracts.forEach((contract) => {
            this.contractService.makePayment(contract.homeowner.email);
        });
        return res.status(OK).send();
    }
}
