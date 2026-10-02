import { Router } from 'express';
import {
  getPublicContent,
  getAdminContent,
  upsertContent,
  getAdminSettings,
  updateAdminSetting
} from '../controllers/content.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/public', getPublicContent);

// Admin Content
router.get('/admin', requireAdmin, getAdminContent);
router.post('/admin/upsert', requireAdmin, upsertContent);

// Admin Settings
router.get('/settings', requireAdmin, getAdminSettings);
router.post('/settings', requireAdmin, updateAdminSetting);

export default router;
