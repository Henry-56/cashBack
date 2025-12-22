import { Router } from 'express';
import * as loanController from '../controllers/loan.controller';

const router = Router();

// Public/Marketplace routes
router.get('/market', loanController.getMarketplaceLoans);

// User-specific routes
router.post('/', loanController.createLoan);
router.post('/:id/fund', loanController.fundLoan);
router.post('/:id/confirm', loanController.confirmLoan); // NEW
router.post('/:id/reject', loanController.rejectLoan);   // NEW
router.get('/', loanController.getMyLoans); // /api/loans?userId=...
router.get('/:id', loanController.getLoanById);

export default router;
