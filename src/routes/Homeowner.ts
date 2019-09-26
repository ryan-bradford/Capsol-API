import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { adminMW, logger, paramMissingError } from '@shared';
import { UserRoles, Homeowner } from '@entities';
import { HomeownerService, ContractService } from 'src/services';


// Init shared
const router = Router();
const homeownerService = new HomeownerService();
const contractService = new ContractService();


/******************************************************************************
 *                      Get All Users - "GET /api/investors"
 ******************************************************************************/

router.get('', adminMW, async (req: Request, res: Response) => {
    try {
        const users = await homeownerService.getAll();
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
        await homeownerService.add(user);
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
        const user = await homeownerService.getOne(email);
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
        await homeownerService.delete(email);
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
        const user = await homeownerService.getOne(email);
        if (user && user.id) {
            await contractService.createContract(10000, 0.04, 20, user.id);
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
