import { Router } from 'express';
import InvestorRoute from './Investor';
import HomeownerRoute from './Homeowner';
import AuthRouter from './Auth';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/investors', InvestorRoute);
router.use('/homeowners', HomeownerRoute);
router.use('/auth', AuthRouter);

// Export the base-router
export default router;
