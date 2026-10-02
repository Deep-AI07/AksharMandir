import { Router } from 'express';
import {
  submitCustomOrder,
  getMyCustomOrders,
  getAdminCustomOrders,
  updateCustomOrderQuote
} from '../controllers/customOrder.controller.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Customer
router.post('/', optionalAuth, submitCustomOrder);
router.get('/my-requests', requireAuth, getMyCustomOrders);

// Admin
router.get('/admin/all', requireAdmin, getAdminCustomOrders);
router.patch('/admin/:id/quote', requireAdmin, updateCustomOrderQuote);

export default router;
