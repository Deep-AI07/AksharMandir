import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
