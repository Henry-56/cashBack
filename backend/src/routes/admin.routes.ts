import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// Protect all admin routes
router.use(isAdmin);

router.get('/loans', adminController.getAllLoans);
router.get('/stats', adminController.getUserStats);

export default router;
