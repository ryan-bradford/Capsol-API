import { Router } from 'express';
import { adminMW } from '@shared';
import InvestorController from 'src/controller/Investor';
import { container } from 'tsyringe';


// Init shared
export default () => {
    const router = Router();
    const controller = container.resolve(InvestorController);

    router.get('', adminMW, (req, res) => controller.getAll(req, res));

    router.post('', (req, res) => controller.addInvestor(req, res));

    router.post('/update', adminMW, (req, res) => controller.handleInvestments(req, res));

    router.get('/:email', adminMW, (req, res) => controller.getInvestor(req, res));

    router.delete('/:email', adminMW, (req, res) => controller.deleteInvestor(req, res));

    router.put('/:email/investment', adminMW, (req, res) => controller.addInvestment(req, res));

    return router;
};
