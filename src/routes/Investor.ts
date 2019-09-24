import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { adminMW, logger, paramMissingError } from '@shared';
import { InvestmentDaoFactory, UserDaoFactory } from '@daos';
import { UserRoles, Investor } from '@entities';


// Init shared
const router = Router();
const userDao = UserDaoFactory();
const investmentDao = InvestmentDaoFactory();


/******************************************************************************
 *                      Get All Users - "GET /api/investors"
 ******************************************************************************/

router.get('', adminMW, async (req: Request, res: Response) => {
    try {
        const users = await userDao.getAll();
        const investors = await Promise.all(users
            .filter((user) => user.role === UserRoles.Investor)
            .map((user) => {
                if (!user.id) {
                    return null;
                } else {
                    const investments = investmentDao.getInvestments(user.id);
                    return investments.then((realInvestments) => {
                        return new Investor(user, undefined, undefined, undefined, undefined, realInvestments);
                    });
                }
            })
            .filter((user) => user !== null));
        return res.status(OK).json({ investors });
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
        await userDao.add(user);
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
        const user = await userDao.getOne(email);
        if (user && user.id) {
            const investor = await investmentDao.getInvestments(user.id).then((investments) => {
                return new Investor(user, undefined, undefined, undefined, undefined, investments);
            });
            return res.status(OK).json(investor);
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
        await userDao.delete(email);
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
        const user = await userDao.getOne(email);
        if (user && user.id) {
            await investmentDao.addFunds(user.id, amount);
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

export default router;
