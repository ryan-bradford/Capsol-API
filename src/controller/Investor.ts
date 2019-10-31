import { IUserDao } from '@daos';
import { Request, Response } from 'express';

import {
    IPersistedInvestor, StoredInvestor, IStorableInvestor,
} from '@entities';

import { IInvestmentService, IRequestService } from '@services';
import { OK, CREATED, NOT_FOUND } from 'http-status-codes';
import { paramMissingError, logger } from '@shared';
import { ParamsDictionary } from 'express-serve-static-core';
import { injectable, inject } from 'tsyringe';
import { ICashDepositDao } from 'src/daos/investment/CashDepositDao';
import { IDateService } from 'src/services/DateService';

@injectable()
export default class InvestorController {


    /**
     * Creates a `InvestorController` using the given investorDao, investmentService, and requestService
     */
    constructor(
        @inject('InvestorDao') private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        @inject('InvestmentService') private investmentService: IInvestmentService,
        @inject('RequestService') private requestService: IRequestService,
        @inject('CashDepositDao') private cashDepositDao: ICashDepositDao,
        @inject('DateService') private dateService: IDateService,
        @inject('FeeRate') private feePercentage: number) { }


    /**
     * Returns every investor as JSON loaded to the given res.
     */
    public async getAll(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        const users = await
            this.investorDao.getAll()
                .then((result) => Promise.all(
                    result.map(async (investor) => {
                        const investments = await this.investmentService.getInvestmentsFor(investor.id);
                        const portfolio = await this.investmentService.getCashValue(investor.id);
                        const cashDeposits = await this.cashDepositDao.getDepositsFor(investor);
                        return StoredInvestor.fromData(investor, investments, cashDeposits, portfolio,
                            this.feePercentage, currentDate);
                    })));
        return res.status(OK).json({ users });
    }


    /**
     * Adds the investor given in the body of the req and returns the new user as JSON in the res.
     */
    public async addInvestor(req: Request, res: Response) {
        // Check parameters
        const { user } = req.body;
        if (!user) {
            throw new Error(paramMissingError);
        }
        // Add new user
        await this.investorDao.add(user);
        return res.status(CREATED).send(user);
    }


    /**
     * Returns the investor whose email is in the params of the request as JSON in the res.
     */
    public async getInvestor(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        const { email } = req.params as ParamsDictionary;
        const investor = await this.investorDao.getOneByEmail(email);
        if (investor) {
            const investments = await this.investmentService.getInvestmentsFor(investor.id);
            const portfolio = await this.investmentService.getCashValue(investor.id);
            const cashDeposits = await this.cashDepositDao.getDepositsFor(investor);
            return res.status(OK).json(
                StoredInvestor.fromData(investor, investments, cashDeposits, portfolio,
                    this.feePercentage, currentDate));
        } else {
            return res.status(NOT_FOUND).end();
        }
    }


    /**
     * Deletes the account and all associated information for the given investor.
     */
    public async deleteInvestor(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        const investor = await this.investorDao.getOneByEmail(email);
        if (!investor || !investor.id) {
            return res.status(NOT_FOUND).end();
        }
        await this.investorDao.delete(investor.id);
        return res.status(OK).end();
    }


    /**
     * Adds an investment of the given amount for the given investor.
     */
    public async addInvestment(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        logger.info(String(currentDate));
        const { email } = req.params as ParamsDictionary;
        const { amount } = req.body;
        if (amount <= 0) {
            throw new Error('Bad amount');
        }
        const user = await this.investorDao.getOneByEmail(email);
        if (user && user.id) {
            await this.investmentService.addFunds(user.id, amount, currentDate);
            return res.status(OK).end();
        } else {
            return res.status(NOT_FOUND).end();
        }
    }


    /**
     * Sells investments of the given amount for the given investor.
     */
    public async sellInvestment(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        const { email } = req.params as ParamsDictionary;
        const { amount } = req.body;
        const user = await this.investorDao.getOneByEmail(email);
        if (user && user.id) {
            await this.investmentService.sellInvestments(user.id, amount, currentDate);
            return res.status(OK).end();
        } else {
            return res.status(NOT_FOUND).end();
        }
    }


    /**
     * Pairs purchase and sell requests and makes the magic happen.
     */
    public async handleInvestments(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        await this.requestService.handleRequests(currentDate);
        res.status(200).send();
    }
}
