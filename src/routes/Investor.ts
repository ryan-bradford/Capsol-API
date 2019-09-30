import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { adminMW, logger, paramMissingError } from '@shared';
import { UserRoles, IInvestor } from '@entities';
import { IUserDao } from '@daos';
import { IInvestmentService } from '@services';


// Init shared
const router = Router();

export default (investorDao: IUserDao<IInvestor>, investmentService: IInvestmentService) => {


    /******************************************************************************
     *                      Get All Users - "GET /api/investors"
     ******************************************************************************/

    router.get('', adminMW, async (req: Request, res: Response) => {
        try {
            const users = await investorDao.getAll();
            return res.status(OK).json({ users });
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    router.post('', adminMW, async (req: Request, res: Response) => {
        try {
            // Check parameters
            const { user } = req.body;
            if (!user) {
                return res.status(BAD_REQUEST).json({
                    error: paramMissingError,
                });
            }
            // Add new user
            user.role = UserRoles.Investor;
            await investorDao.add(user);
            return res.status(CREATED).end();
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    router.get('/:email', adminMW, async (req: Request, res: Response) => {
        try {
            const { email } = req.params as ParamsDictionary;
            const user = await investorDao.getOne(email);
            if (user && user.id) {
                return res.status(OK).json(user);
            } else {
                throw new Error('Bad user');
            }
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    router.delete('/:email', adminMW, async (req: Request, res: Response) => {
        try {
            const { email } = req.params as ParamsDictionary;
            await investorDao.delete(email);
            return res.status(OK).end();
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    router.put('/:email/investment', adminMW, async (req: Request, res: Response) => {
        try {
            const { email } = req.params as ParamsDictionary;
            const { amount } = req.body;
            const user = await investorDao.getOne(email);
            if (user && user.id) {
                await investmentService.addFunds(user.id, amount);
                return res.status(OK).end();
            } else {
                throw new Error('Bad user');
            }
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    return router;
};
