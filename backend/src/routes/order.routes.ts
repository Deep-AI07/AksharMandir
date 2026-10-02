import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus
} from '../controllers/order.controller.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Customer
router.post('/', optionalAuth, createOrder);
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

// Admin
router.get('/admin/all', requireAdmin, getAdminOrders);
router.patch('/admin/:id/status', requireAdmin, updateOrderStatus);

export default router;
