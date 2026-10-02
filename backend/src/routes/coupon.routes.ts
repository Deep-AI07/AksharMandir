import { Router } from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/coupon.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public validation
router.post('/validate', validateCoupon);

// Admin Management
router.get('/', requireAdmin, getCoupons);
router.post('/', requireAdmin, createCoupon);
router.put('/:id', requireAdmin, updateCoupon);
router.delete('/:id', requireAdmin, deleteCoupon);

export default router;
