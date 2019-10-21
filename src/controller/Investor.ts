import { IUserDao } from '@daos';
import { Request, Response } from 'express';

import {
    IPersistedInvestor, StoredInvestor,
    IStorableInvestor, StoredInvestment,
} from '@entities';

import { IInvestmentService, IRequestService } from '@services';
import { OK, BAD_REQUEST, CREATED, NOT_FOUND } from 'http-status-codes';
import { logger, paramMissingError } from '@shared';
import { ParamsDictionary } from 'express-serve-static-core';

export default class InvestorController {


    constructor(
        private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        private investmentService: IInvestmentService,
        private requestService: IRequestService) { }


    public async getAll(req: Request, res: Response) {
        const users = await
            this.investorDao.getAll()
                .then((result) => Promise.all(
                    result.map(async (investor) => {
                        const investments = (await this.investmentService.getInvestmentsFor(investor.id))
                            .map((investment) =>
                                new StoredInvestment(investment.id, investment.contract.id,
                                    investment.value, investment.owner.id));
                        const portfolio = await this.investmentService.getPortfolioValue(investor.id);
                        return new StoredInvestor(investor.id, portfolio, investments,
                            investor.name, investor.email, investor.pwdHash);
                    })));
        return res.status(OK).json({ users });
    }


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


    public async getInvestor(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        const investor = await this.investorDao.getOneByEmail(email);
        if (investor) {
            const investments = (await this.investmentService.getInvestmentsFor(investor.id))
                .map((investment) =>
                    new StoredInvestment(investment.id, investment.contract.id,
                        investment.value, investment.owner.id));
            const portfolio = await this.investmentService.getPortfolioValue(investor.id);
            return res.status(OK).json(
                new StoredInvestor(investor.id, portfolio, investments,
                    investor.name, investor.email, investor.pwdHash));
        } else {
            return res.status(NOT_FOUND).end();
        }
    }


    public async deleteInvestor(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        const investor = await this.investorDao.getOneByEmail(email);
        if (!investor || !investor.id) {
            return res.status(NOT_FOUND).end();
        }
        await this.investorDao.delete(investor.id);
        return res.status(OK).end();
    }


    public async addInvestment(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        const { amount } = req.body;
        const user = await this.investorDao.getOneByEmail(email);
        if (user && user.id) {
            await this.investmentService.addFunds(user.id, amount);
            return res.status(OK).end();
        } else {
            return res.status(NOT_FOUND).end();
        }
    }


    public async handleInvestments(req: Request, res: Response) {
        await this.requestService.handleRequests();
        res.status(200).send();
    }
}
