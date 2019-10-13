import { IUserDao } from '@daos';
import { Request, Response } from 'express';

import { IPersistedInvestor, IStoredInvestor, StorableInvestor, StoredInvestor } from '@entities';

import { IInvestmentService } from '@services';
import { OK, BAD_REQUEST, CREATED, NOT_FOUND } from 'http-status-codes';
import { logger, paramMissingError } from '@shared';
import { ParamsDictionary } from 'express-serve-static-core';

export default class InvestorController {


    constructor(
        private investorDao: IUserDao<IPersistedInvestor, IStoredInvestor>,
        private investmentService: IInvestmentService) { }


    public async getAll(req: Request, res: Response) {
        try {
            const users = (await this.investorDao.getAll()).map((investor) =>
                new StoredInvestor(investor.id, investor.name, investor.email, investor.pwdHash,
                    investor.portfolioValue));
            return res.status(OK).json({ users });
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    }


    public async addInvestor(req: Request, res: Response) {
        try {
            // Check parameters
            const { user } = req.body;
            if (!user) {
                return res.status(BAD_REQUEST).json({
                    error: paramMissingError,
                });
            }
            // Add new user
            await this.investorDao.add(user);
            return res.status(CREATED).send(user);
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    }


    public async getInvestor(req: Request, res: Response) {
        try {
            const { email } = req.params as ParamsDictionary;
            const investor = await this.investorDao.getOne(email);
            if (investor) {
                return res.status(OK).json(
                    new StoredInvestor(investor.id, investor.name, investor.email, investor.pwdHash,
                        investor.portfolioValue));
            } else {
                return res.status(NOT_FOUND).end();
            }
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    }


    public async deleteInvestor(req: Request, res: Response) {
        try {
            const { email } = req.params as ParamsDictionary;
            const investor = await this.investorDao.getOne(email);
            if (!investor || !investor.id) {
                return res.status(NOT_FOUND).end();
            }
            await this.investorDao.delete(investor.id);
            return res.status(OK).end();
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    }


    public async addInvestment(req: Request, res: Response) {
        try {
            const { email } = req.params as ParamsDictionary;
            const { amount } = req.body;
            const user = await this.investorDao.getOne(email);
            if (user && user.id) {
                await this.investmentService.addFunds(user.id, amount);
                return res.status(OK).end();
            } else {
                return res.status(NOT_FOUND).end();
            }
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    }
}
