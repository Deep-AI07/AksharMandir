import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { isValidEmail, isValidPhone, isValidPincode, isNonEmptyString } from '../validators/index.js';

// Safe JSON parser helper for address snapshots
const safeParseJson = (data: any, fallback: any = {}) => {
  if (typeof data !== 'string') return data || fallback;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

// POST /api/orders - Customer: Create order with stock decrement & database transaction
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || null;
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress, // Full Address object
      items, // [{ productId, quantity, finish, price, title, image, sku }]
      couponCode,
      paymentMethod, // 'UPI' | 'QR' | 'CARD' | 'COD'
      notes
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'All checkout details and items are required.' });
      return;
    }

    if (!isNonEmptyString(customerName, 2, 80)) {
      res.status(400).json({ success: false, message: 'Customer full name must be between 2 and 80 characters.' });
      return;
    }

    if (!isValidEmail(customerEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid customer email address.' });
      return;
    }

    if (!isValidPhone(customerPhone)) {
      res.status(400).json({ success: false, message: 'Please provide a valid contact phone number.' });
      return;
    }

    if (!shippingAddress.streetAddress || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      res.status(400).json({ success: false, message: 'Shipping street address, city, state, and pincode are required.' });
      return;
    }

    if (!isValidPincode(shippingAddress.pincode)) {
      res.status(400).json({ success: false, message: 'Please enter a valid postal pincode.' });
      return;
    }

    if (items.length > 50) {
      res.status(400).json({ success: false, message: 'Order exceeds maximum allowable item count (50 items).' });
      return;
    }

    for (const it of items) {
      const q = parseInt(it.quantity, 10);
      if (isNaN(q) || q < 1 || q > 50) {
        res.status(400).json({ success: false, message: `Invalid quantity for item "${it.title || it.productId}". Must be between 1 and 50.` });
        return;
      }
    }

    const validPaymentMethods = ['UPI', 'QR', 'CARD', 'COD', 'UPI / QR', 'Credit/Debit Card', 'Cash on Delivery'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      res.status(400).json({ success: false, message: 'Invalid payment method selected.' });
      return;
    }

    // Standardize payment method
    let standardPaymentMethod = 'UPI';
    if (paymentMethod.includes('QR') || paymentMethod === 'QR') standardPaymentMethod = 'QR';
    else if (paymentMethod.includes('Card') || paymentMethod === 'CARD') standardPaymentMethod = 'CARD';
    else if (paymentMethod.includes('Cash') || paymentMethod === 'COD') standardPaymentMethod = 'COD';

    // Start DB Transaction for Inventory Decrement & Order Creation
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate = [];

      // 1. Verify and decrement stock for each item atomically
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product || product.status !== 'ACTIVE') {
          throw new Error(`Product "${item.title || item.productId}" is not available.`);
        }

        const qty = parseInt(item.quantity, 10);
        if (product.stockQuantity < qty) {
          throw new Error(`Insufficient stock for "${product.title}". Only ${product.stockQuantity} remaining.`);
        }

        // Decrement inventory
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: { decrement: qty }
          }
        });

        const itemSubtotal = product.price * qty;
        subtotal += itemSubtotal;

        orderItemsToCreate.push({
          productId: product.id,
          title: product.title,
          sku: product.sku,
          image: item.image || (await tx.productImage.findFirst({ where: { productId: product.id } }))?.url || '',
          finish: item.finish || product.colorFinish || 'Natural Teak Polish',
          price: product.price,
          quantity: qty,
        });
      }

      // 2. Validate and apply coupon if present
      let discount = 0;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() }
        });

        if (coupon && coupon.isActive && subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
              discount = coupon.maxDiscountAmount;
            }
          } else {
            discount = Math.min(coupon.discountValue, subtotal);
          }
          discount = Math.round(discount);

          // Increment coupon usage
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { timesUsed: { increment: 1 } }
          });
        }
      }

      const total = Math.max(0, subtotal - discount);

      // 3. Generate Order Number
      const timestamp = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `AKM-${timestamp}-${randomSuffix}`;

      // 4. Determine initial payment and order status
      const isOnlinePaid = standardPaymentMethod !== 'COD';
      const initialPaymentStatus = isOnlinePaid ? 'SUCCESS' : 'PENDING';
      const initialOrderStatus = isOnlinePaid ? 'CONFIRMED' : 'PENDING';

      // 5. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: customerName.trim(),
          customerEmail: customerEmail.toLowerCase().trim(),
          customerPhone: customerPhone.trim(),
          addressSnapshot: JSON.stringify(shippingAddress),
          subtotal,
          discount,
          couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
          shipping: 0,
          tax: 0,
          total,
          paymentMethod: standardPaymentMethod,
          paymentStatus: initialPaymentStatus,
          orderStatus: initialOrderStatus,
          deliveryStatus: 'NOT_DELIVERED',
          notes: notes || null,
          items: {
            create: orderItemsToCreate
          },
          payments: {
            create: [
              {
                paymentId: `PAY-${standardPaymentMethod}-${randomSuffix}-${Date.now().toString().slice(-4)}`,
                paymentMethod: standardPaymentMethod,
                amount: total,
                status: initialPaymentStatus,
                transactionRef: isOnlinePaid ? `TXN_${standardPaymentMethod}_${Date.now()}` : 'COD_PENDING',
                rawDetails: JSON.stringify({
                  method: standardPaymentMethod,
                  simulated: true,
                  timestamp: new Date().toISOString()
                })
              }
            ]
          }
        },
        include: {
          items: true,
          payments: true,
        }
      });

      // 6. Clear user cart and guest cart
      if (userId) {
        const cart = await tx.cart.findUnique({ where: { userId } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      }
      if (sessionId) {
        const guestCart = await tx.cart.findUnique({ where: { sessionId } });
        if (guestCart) {
          await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } });
        }
      }

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Sacred order placed successfully!',
      data: { order: result }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error processing order.' });
  }
};

// GET /api/orders/my-orders - Customer: Get logged-in user orders only
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    // Auto-link any past guest orders with matching email that have userId: null
    if (userEmail) {
      await prisma.order.updateMany({
        where: {
          userId: null,
          customerEmail: userEmail
        },
        data: {
          userId: req.user.id
        }
      }).catch(err => console.warn('Could not auto-link past guest orders:', err));
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          ...(userEmail ? [{ customerEmail: userEmail }] : []),
          ...(req.user.email && req.user.email !== userEmail ? [{ customerEmail: req.user.email }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: true,
      }
    });

    const formattedOrders = orders.map(ord => ({
      ...ord,
      addressSnapshot: safeParseJson(ord.addressSnapshot),
    }));

    res.json({
      success: true,
      data: { orders: formattedOrders }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching orders.' });
  }
};

// GET /api/orders/:id - Customer / Admin: Get order details by ID or orderNumber
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, slug: true, title: true }
            }
          }
        },
        payments: true,
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Security and privacy check:
    const isOwner = req.user && (
      (order.userId && order.userId === req.user.id) ||
      (order.customerEmail.toLowerCase() === req.user.email.toLowerCase())
    );
    const isAdmin = req.user?.role === 'ADMIN';

    // If neither authenticated owner nor admin, check if guest provided matching email/phone verification
    if (!isAdmin && !isOwner) {
      const verifyEmail = (req.query.email as string) || (req.headers['x-order-email'] as string);
      const verifyPhone = (req.query.phone as string) || (req.headers['x-order-phone'] as string);

      const emailMatches = verifyEmail && verifyEmail.toLowerCase().trim() === order.customerEmail.toLowerCase();
      const phoneMatches = verifyPhone && verifyPhone.trim() === order.customerPhone.trim();

      if (!emailMatches && !phoneMatches) {
        res.status(403).json({
          success: false,
          message: 'Access restricted: Please log in or provide matching order email verification to view this order.'
        });
        return;
      }
    }

    res.json({
      success: true,
      data: {
        order: {
          ...order,
          addressSnapshot: safeParseJson(order.addressSnapshot),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching order.' });
  }
};

// GET /api/admin/orders - Admin: List all orders with filters
export const getAdminOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, deliveryStatus, paymentMethod, paymentStatus, search, page = '1', limit = '20' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};

    if (status && status !== 'All') where.orderStatus = status as string;
    if (deliveryStatus && deliveryStatus !== 'All') where.deliveryStatus = deliveryStatus as string;
    if (paymentMethod && paymentMethod !== 'All') where.paymentMethod = paymentMethod as string;
    if (paymentStatus && paymentStatus !== 'All') where.paymentStatus = paymentStatus as string;

    if (search && (search as string).trim() !== '') {
      const q = (search as string).trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerEmail: { contains: q } },
        { customerPhone: { contains: q } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          items: true,
          payments: true,
        }
      }),
      prisma.order.count({ where })
    ]);

    const formattedOrders = orders.map(ord => ({
      ...ord,
      addressSnapshot: safeParseJson(ord.addressSnapshot),
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching admin orders.' });
  }
};

// PATCH /api/admin/orders/:id/status - Admin: Update order status & delivery status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { orderStatus, deliveryStatus, paymentStatus, trackingNumber } = req.body;

    const validOrderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'CANCELLED'];
    const validDeliveryStatuses = ['NOT_DELIVERED', 'DELIVERED'];
    const validPaymentStatuses = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      res.status(400).json({ success: false, message: 'Invalid order status value.' });
      return;
    }

    if (deliveryStatus && !validDeliveryStatuses.includes(deliveryStatus)) {
      res.status(400).json({ success: false, message: 'Delivery status must be NOT_DELIVERED or DELIVERED.' });
      return;
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      res.status(400).json({ success: false, message: 'Invalid payment status value.' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || undefined,
        deliveryStatus: deliveryStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
      },
      include: {
        items: true,
        payments: true,
      }
    });

    // If payment status was updated, also sync latest payment record
    if (paymentStatus) {
      const latestPayment = await prisma.payment.findFirst({
        where: { orderId: id },
        orderBy: { createdAt: 'desc' }
      });
      if (latestPayment) {
        await prisma.payment.update({
          where: { id: latestPayment.id },
          data: { status: paymentStatus }
        });
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      data: {
        order: {
          ...updated,
          addressSnapshot: safeParseJson(updated.addressSnapshot),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating order status.' });
  }
};
