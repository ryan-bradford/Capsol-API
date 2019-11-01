import { IUserDao } from '@daos';
import { Request, Response } from 'express';

import {
    IPersistedInvestor, StoredInvestor, IStorableInvestor, StorableInvestor, IPersistedHomeowner, IStorableHomeowner,
} from '@entities';

import { IInvestmentService, IRequestService } from '@services';
import { OK, CREATED } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { injectable, inject } from 'tsyringe';
import { ICashDepositDao } from 'src/daos/investment/CashDepositDao';
import { IDateService } from 'src/services/DateService';
import { NotFoundError } from 'src/shared/error/NotFound';
import { ClientError } from 'src/shared/error/ClientError';
import { validateOrReject } from 'class-validator';

@injectable()
export default class InvestorController {


    /**
     * Creates a `InvestorController` using the given investorDao, investmentService, and requestService
     */
    constructor(
        @inject('InvestorDao') private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        @inject('HomeownerDao') private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
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
            throw new ClientError(`Need to provide a user in the JSON body`);
        }
        const toAdd = new StorableInvestor(user.name, user.email, user.password);
        await validateOrReject(toAdd).catch((error) => {
            throw new ClientError(error);
        });
        const currentInvestor = await this.investorDao.getOne(toAdd.email);
        const currentHomeowner = await this.homeownerDao.getOne(toAdd.email);
        if (currentHomeowner || currentInvestor) {
            throw new ClientError(`User wth email ${user.email} already exists`);
        }
        // Add new user
        await this.investorDao.add(toAdd);
        return res.status(CREATED).send(user);
    }


    /**
     * Returns the investor whose email is in the params of the request as JSON in the res.
     */
    public async getInvestor(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        const { email } = req.params as ParamsDictionary;
        if (!email || typeof email !== 'string') {
            throw new ClientError('Need to provide a string email in the URL params');
        }
        const investor = await this.investorDao.getOneByEmail(email);
        if (investor) {
            const investments = await this.investmentService.getInvestmentsFor(investor.id);
            const portfolio = await this.investmentService.getCashValue(investor.id);
            const cashDeposits = await this.cashDepositDao.getDepositsFor(investor);
            return res.status(OK).json(
                StoredInvestor.fromData(investor, investments, cashDeposits, portfolio,
                    this.feePercentage, currentDate));
        } else {
            throw new NotFoundError(`User with email ${email} was not found`);
        }
    }


    /**
     * Deletes the account and all associated information for the given investor.
     */
    public async deleteInvestor(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        if (!email || typeof email !== 'string') {
            throw new ClientError('Need to provide a string email in the URL params');
        }
        const investor = await this.investorDao.getOneByEmail(email);
        if (!investor) {
            throw new NotFoundError(`User with email ${email} was not found`);
        }
        await this.investorDao.delete(investor.id);
        return res.status(OK).end();
    }


    /**
     * Adds an investment of the given amount for the given investor.
     */
    public async addInvestment(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        const { email } = req.params as ParamsDictionary;
        if (!email || typeof email !== 'string') {
            throw new ClientError('Need to provide a string email in the URL params');
        }
        const { amount } = req.body;
        if (amount === undefined || typeof amount !== 'number' || amount < 0) {
            throw new ClientError('Need to provide an amount in the body');
        }
        const user = await this.investorDao.getOneByEmail(email);
        if (user) {
            await this.investmentService.addFunds(user.id, amount, currentDate);
            return res.status(OK).end();
        } else {
            throw new NotFoundError(`User with email ${email} was not found`);
        }
    }


    /**
     * Sells investments of the given amount for the given investor.
     */
    public async sellInvestment(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        const { email } = req.params as ParamsDictionary;
        if (!email || typeof email !== 'string') {
            throw new ClientError('Need to provide a string email in the URL params');
        }
        const { amount } = req.body;
        if (amount === undefined || typeof amount !== 'number' || amount < 0) {
            throw new ClientError('Need to provide an amount in the body');
        }
        const user = await this.investorDao.getOneByEmail(email);
        if (user) {
            await this.investmentService.sellInvestments(user.id, amount, currentDate);
            return res.status(OK).end();
        } else {
            throw new NotFoundError(`User with email ${email} was not found`);
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
