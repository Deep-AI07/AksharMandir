import { Router } from 'express';
import {
  createReview,
  getAdminReviews,
  updateReviewApproval,
  deleteReview
} from '../controllers/review.controller.js';
import { optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, createReview);
router.get('/admin/all', requireAdmin, getAdminReviews);
router.patch('/admin/:id/approval', requireAdmin, updateReviewApproval);
router.delete('/admin/:id', requireAdmin, deleteReview);

export default router;
