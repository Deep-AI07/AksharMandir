import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { isValidEmail, isNonEmptyString } from '../validators/index.js';

// POST /api/reviews - Customer: Submit product review
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || null;
    const { productId, rating, title, comment, userName, userEmail } = req.body;

    if (!productId || rating === undefined || !comment) {
      res.status(400).json({ success: false, message: 'Product ID, rating (1-5), and comment are required.' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'ACTIVE') {
      res.status(404).json({ success: false, message: 'Product not found or unavailable for review.' });
      return;
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    if (!isNonEmptyString(comment, 5, 1000)) {
      res.status(400).json({ success: false, message: 'Review comment must be between 5 and 1000 characters.' });
      return;
    }

    if (userEmail && !isValidEmail(userEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    const numericRating = Math.min(5, Math.max(1, parsedRating));

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        userName: userName ? userName.trim() : (req.user?.name || 'Sanctum Devotee'),
        userEmail: userEmail ? userEmail.trim().toLowerCase() : (req.user?.email || null),
        rating: numericRating,
        title: title ? title.trim() : null,
        comment: comment.trim(),
        isApproved: true, // Auto-approve or queue for moderation
      }
    });

    // Recalculate product rating average
    const allProductReviews = await prisma.review.findMany({
      where: { productId, isApproved: true }
    });

    const avgRating = allProductReviews.length > 0
      ? allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length
      : 5.0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewsCount: allProductReviews.length,
      }
    });

    // Omit private userEmail from public response
    const { userEmail: _, ...publicReview } = review;

    res.status(201).json({
      success: true,
      message: 'Thank you for your review! It has been posted to the sanctum catalog.',
      data: { review: publicReview }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting review.' });
  }
};

// GET /api/admin/reviews - Admin: List reviews for moderation
export const getAdminReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isApproved, productId, search, page = '1', limit = '20' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};
    if (isApproved !== undefined && isApproved !== 'All') {
      where.isApproved = isApproved === 'true';
    }
    if (productId && productId !== 'All') {
      where.productId = productId as string;
    }
    if (search && (search as string).trim() !== '') {
      const q = (search as string).trim();
      where.OR = [
        { userName: { contains: q } },
        { title: { contains: q } },
        { comment: { contains: q } },
        { product: { title: { contains: q } } }
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          product: {
            select: { id: true, title: true, slug: true, sku: true }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching reviews.' });
  }
};

// PATCH /api/admin/reviews/:id/approval - Admin: Toggle review approval
export const updateReviewApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) }
    });

    res.json({
      success: true,
      message: `Review has been ${isApproved ? 'approved' : 'hidden'}.`,
      data: { review: updated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating review status.' });
  }
};

// DELETE /api/admin/reviews/:id - Admin: Delete review
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting review.' });
  }
};
