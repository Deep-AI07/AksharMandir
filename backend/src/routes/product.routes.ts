import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  updateProductStatus,
  updateProductStock,
  deleteProduct
} from '../controllers/product.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Admin Protected
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.patch('/:id/status', requireAdmin, updateProductStatus);
router.patch('/:id/stock', requireAdmin, updateProductStock);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
