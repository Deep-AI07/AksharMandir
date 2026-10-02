import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper to merge guest wishlist into user wishlist
export const mergeGuestWishlist = async (userId: string, sessionId?: string): Promise<void> => {
  if (!userId || !sessionId) return;
  try {
    const guestWishlist = await prisma.wishlist.findUnique({
      where: { sessionId },
      include: {
        items: true
      }
    });

    if (!guestWishlist || guestWishlist.items.length === 0) return;

    let userWishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!userWishlist) {
      userWishlist = await prisma.wishlist.create({
        data: { userId }
      });
    }

    for (const item of guestWishlist.items) {
      const existing = await prisma.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId: userWishlist.id,
            productId: item.productId
          }
        }
      });

      if (!existing) {
        await prisma.wishlistItem.create({
          data: {
            wishlistId: userWishlist.id,
            productId: item.productId
          }
        });
      }
    }

    // Clean up guest wishlist items and guest wishlist
    await prisma.wishlistItem.deleteMany({ where: { wishlistId: guestWishlist.id } });
    await prisma.wishlist.delete({ where: { id: guestWishlist.id } }).catch(() => {});
  } catch (error) {
    console.warn('Error merging guest wishlist into user wishlist:', error);
  }
};

const getOrCreateWishlist = async (userId?: string, sessionId?: string) => {
  if (userId) {
    if (sessionId) {
      await mergeGuestWishlist(userId, sessionId);
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { displayOrder: 'asc' } }, category: true }
            }
          }
        }
      }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { displayOrder: 'asc' } }, category: true }
              }
            }
          }
        }
      });
    }
    return wishlist;
  }

  if (sessionId) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { displayOrder: 'asc' } }, category: true }
            }
          }
        }
      }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { displayOrder: 'asc' } }, category: true }
              }
            }
          }
        }
      });
    }
    return wishlist;
  }

  throw new Error('Either userId or sessionId must be provided.');
};

// GET /api/wishlist - Get wishlist items
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);

    if (!userId && !sessionId) {
      res.json({ success: true, data: { items: [], productIds: [] } });
      return;
    }

    const wishlist = await getOrCreateWishlist(userId, sessionId);

    const items = wishlist.items.map(item => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        sku: item.product.sku,
        category: item.product.category.name,
        price: item.product.price,
        originalPrice: item.product.originalPrice,
        rating: item.product.rating,
        stockQuantity: item.product.stockQuantity,
        inStock: item.product.stockQuantity > 0,
        images: item.product.images.map(img => img.url),
      },
      createdAt: item.createdAt,
    }));

    res.json({
      success: true,
      data: {
        items,
        productIds: items.map(i => i.productId),
        count: items.length,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching wishlist.' });
  }
};

// POST /api/wishlist/toggle - Toggle product in wishlist
export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const wishlist = await getOrCreateWishlist(userId, sessionId);

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        }
      }
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      res.json({
        success: true,
        isSaved: false,
        message: 'Product removed from your sacred wishlist.'
      });
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        }
      });
      res.json({
        success: true,
        isSaved: true,
        message: 'Product saved to your sacred wishlist.'
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating wishlist.' });
  }
};
