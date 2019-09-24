import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { adminMW, logger, paramMissingError } from '@shared';
import { UserDaoFactory, ContractDaoFactory } from '@daos';
import { UserRoles, Homeowner } from '@entities';


// Init shared
const router = Router();
const userDao = UserDaoFactory();
const contractDao = ContractDaoFactory();


/******************************************************************************
 *                      Get All Users - "GET /api/investors"
 ******************************************************************************/

router.get('', adminMW, async (req: Request, res: Response) => {
    try {
        const users = await userDao.getAll();
        const investors = await Promise.all(users
            .filter((user) => user.role === UserRoles.Homeowner)
            .map((user) => {
                if (!user.id) {
                    return null;
                } else {
                    contractDao.getContracts(user.id).then((contracts) => {
                        return new Homeowner(user, undefined, undefined, undefined, undefined, contracts[0]);
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
            const homeowner = await contractDao.getContracts(user.id).then((contracts) => {
                return new Homeowner(user, undefined, undefined, undefined, undefined, contracts[0]);
            });
            return res.status(OK).json(homeowner);
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

router.put('/:email/home', adminMW, async (req: Request, res: Response) => {
    try {
        const { email } = req.params as ParamsDictionary;
        const { amount } = req.body;
        const user = await userDao.getOne(email);
        if (user && user.id) {
            await contractDao.createContract(10000, 0.04, 20, user.id);
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
