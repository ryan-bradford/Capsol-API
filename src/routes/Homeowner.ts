import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, NOT_FOUND } from 'http-status-codes';
import { adminMW } from '@shared';
import HomeownerController from 'src/controller/Homeowner';
import { container } from 'tsyringe';


export default () => {
    const router = Router();
    const controller = container.resolve(HomeownerController);

    router.get('', adminMW, (req, res) => controller.getUsers(req, res));

    router.get('/:email/options/:option', adminMW, (req, res) => controller.getOptionDetails(req, res));

    router.post('', (req, res) => controller.addUser(req, res));

    router.post('/payments', adminMW, (req, res) => controller.makeAllPayments(req, res));

    router.get('/:email', adminMW, (req, res) => controller.getUser(req, res));

    router.delete('/:email', adminMW, (req, res) => controller.deleteUser(req, res));

    router.put('/:email/home', adminMW, (req, res) => controller.signUpHome(req, res));

    return router;

};
