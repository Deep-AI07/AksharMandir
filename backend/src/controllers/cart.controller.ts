import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper to merge guest cart into user cart
export const mergeGuestCart = async (userId: string, sessionId?: string): Promise<void> => {
  if (!userId || !sessionId) return;
  try {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: true
      }
    });

    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId }
      });
    }

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_productId_selectedFinish: {
            cartId: userCart.id,
            productId: item.productId,
            selectedFinish: item.selectedFinish
          }
        }
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + item.quantity,
            customNotes: item.customNotes || existing.customNotes
          }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            selectedFinish: item.selectedFinish,
            customNotes: item.customNotes
          }
        });
      }
    }

    // Clean up guest cart items and guest cart
    await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
    await prisma.cart.delete({ where: { id: guestCart.id } }).catch(() => {});
  } catch (error) {
    console.warn('Error merging guest cart into user cart:', error);
  }
};

// Helper to find or create cart for user or guest session
const getOrCreateCart = async (userId?: string, sessionId?: string) => {
  if (userId) {
    if (sessionId) {
      await mergeGuestCart(userId, sessionId);
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { displayOrder: 'asc' } } }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { displayOrder: 'asc' } } }
              }
            }
          }
        }
      });
    }
    return cart;
  }

  if (sessionId) {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { displayOrder: 'asc' } } }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { displayOrder: 'asc' } } }
              }
            }
          }
        }
      });
    }
    return cart;
  }

  throw new Error('Either userId or sessionId must be provided.');
};

// GET /api/cart - Get current cart with live totals and backend stock validation
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);

    if (!userId && !sessionId) {
      res.json({
        success: true,
        data: {
          items: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          itemCount: 0,
        }
      });
      return;
    }

    const cart = await getOrCreateCart(userId, sessionId);

    let subtotal = 0;
    const formattedItems = cart.items.map(item => {
      const itemPrice = item.product.price;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      return {
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          sku: item.product.sku,
          price: item.product.price,
          originalPrice: item.product.originalPrice,
          images: item.product.images.map(img => img.url),
          stockQuantity: item.product.stockQuantity,
          inStock: item.product.stockQuantity > 0,
        },
        quantity: item.quantity,
        selectedFinish: item.selectedFinish,
        customNotes: item.customNotes,
        subtotal: itemSubtotal,
        isStockSufficient: item.product.stockQuantity >= item.quantity,
      };
    });

    res.json({
      success: true,
      data: {
        cartId: cart.id,
        items: formattedItems,
        subtotal,
        itemCount: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching cart.' });
  }
};

// POST /api/cart/add - Add item to cart with backend stock validation
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;
    const { productId, quantity = 1, finish, customNotes } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const qty = Math.max(1, parseInt(quantity, 10));

    // 1. Verify product in database
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.status !== 'ACTIVE') {
      res.status(404).json({ success: false, message: 'Product is currently unavailable.' });
      return;
    }

    // 2. Validate stock
    if (product.stockQuantity < qty) {
      res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} units available in stock. Cannot add ${qty}.`
      });
      return;
    }

    const cart = await getOrCreateCart(userId, sessionId);
    const selectedFinish = finish || product.colorFinish || 'Natural Teak Polish';

    // 3. Check if already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_selectedFinish: {
          cartId: cart.id,
          productId,
          selectedFinish,
        }
      }
    });

    if (existingItem) {
      const newTotalQty = existingItem.quantity + qty;
      if (product.stockQuantity < newTotalQty) {
        res.status(400).json({
          success: false,
          message: `Cannot add more. You already have ${existingItem.quantity} in your cart and total stock is ${product.stockQuantity}.`
        });
        return;
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newTotalQty,
          customNotes: customNotes !== undefined ? customNotes : existingItem.customNotes
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: qty,
          selectedFinish,
          customNotes: customNotes || null,
        }
      });
    }

    res.json({
      success: true,
      message: `"${product.title}" added to your sacred cart.`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error adding to cart.' });
  }
};

// PUT /api/cart/update - Update quantity of specific cart item
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;
    const { itemId, quantity } = req.body;

    if (!itemId || quantity === undefined) {
      res.status(400).json({ success: false, message: 'Item ID and quantity are required.' });
      return;
    }

    const qty = parseInt(quantity, 10);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true, cart: true }
    });

    if (!cartItem) {
      res.status(404).json({ success: false, message: 'Cart item not found.' });
      return;
    }

    // Verify cart item ownership
    const isOwner = (userId && cartItem.cart.userId === userId) || (sessionId && cartItem.cart.sessionId === sessionId);
    if (!isOwner) {
      res.status(403).json({ success: false, message: 'Unauthorized: You do not have permission to modify this cart item.' });
      return;
    }

    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      res.json({ success: true, message: 'Item removed from cart.' });
      return;
    }

    if (qty > 20) {
      res.status(400).json({ success: false, message: 'Maximum quantity per item is 20.' });
      return;
    }

    if (cartItem.product.stockQuantity < qty) {
      res.status(400).json({
        success: false,
        message: `Only ${cartItem.product.stockQuantity} units available in stock.`
      });
      return;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: qty }
    });

    res.json({
      success: true,
      message: 'Cart updated successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating cart item.' });
  }
};

// DELETE /api/cart/item/:itemId - Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!cartItem) {
      res.status(404).json({ success: false, message: 'Cart item not found.' });
      return;
    }

    // Verify cart item ownership
    const isOwner = (userId && cartItem.cart.userId === userId) || (sessionId && cartItem.cart.sessionId === sessionId);
    if (!isOwner) {
      res.status(403).json({ success: false, message: 'Unauthorized: You do not have permission to remove this cart item.' });
      return;
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    res.json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error removing item from cart.' });
  }
};

// POST /api/cart/clear - Clear entire cart
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;

    if (userId) {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    } else if (sessionId) {
      const cart = await prisma.cart.findUnique({ where: { sessionId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error clearing cart.' });
  }
};
