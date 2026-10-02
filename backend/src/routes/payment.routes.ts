import { Router } from 'express';
import { initiatePayment, getAdminPayments } from '../controllers/payment.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/initiate', initiatePayment);
router.get('/admin/all', requireAdmin, getAdminPayments);

export default router;
