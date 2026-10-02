import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { isPositiveNumber, isNonNegativeNumber, isNonEmptyString } from '../validators/index.js';

// POST /api/coupons/validate - Public: Validate coupon and calculate exact discount
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required.' });
      return;
    }

    const numericSubtotal = parseFloat(subtotal) || 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!coupon || !coupon.isActive) {
      res.status(400).json({ success: false, message: 'Invalid or inactive coupon code.' });
      return;
    }

    // Check date bounds
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      res.status(400).json({ success: false, message: 'This coupon offer has not started yet.' });
      return;
    }
    if (coupon.endDate && now > coupon.endDate) {
      res.status(400).json({ success: false, message: 'This coupon code has expired.' });
      return;
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
      return;
    }

    // Check minimum order amount
    if (numericSubtotal < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount for code ${coupon.code} is ₹${coupon.minOrderAmount.toLocaleString('en-IN')}.`
      });
      return;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (numericSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // FIXED
      discountAmount = Math.min(coupon.discountValue, numericSubtotal);
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount.toLocaleString('en-IN')}.`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
        finalTotal: Math.max(0, numericSubtotal - Math.round(discountAmount)),
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error validating coupon.' });
  }
};

// GET /api/coupons - Admin: List all coupons
export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { coupons }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching coupons.' });
  }
};

// POST /api/coupons - Admin: Create coupon
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType = 'PERCENTAGE', discountValue, minOrderAmount = 0, maxDiscountAmount, usageLimit, startDate, endDate, isActive = true } = req.body;

    if (!code || discountValue === undefined) {
      res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
      return;
    }

    if (!isNonEmptyString(code, 2, 30)) {
      res.status(400).json({ success: false, message: 'Coupon code must be between 2 and 30 characters.' });
      return;
    }

    const numDiscount = parseFloat(discountValue);
    if (isNaN(numDiscount) || numDiscount <= 0) {
      res.status(400).json({ success: false, message: 'Discount value must be a positive number.' });
      return;
    }

    if (discountType === 'PERCENTAGE' && numDiscount > 100) {
      res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100%.' });
      return;
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
        discountValue: numDiscount,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: Boolean(isActive),
      }
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data: { coupon }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating coupon.' });
  }
};

// PUT /api/coupons/:id - Admin: Update coupon
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, startDate, endDate, isActive } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        discountType: discountType || undefined,
        discountValue: discountValue !== undefined ? parseFloat(discountValue) : undefined,
        minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount !== undefined ? (maxDiscountAmount ? parseFloat(maxDiscountAmount) : null) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? parseInt(usageLimit, 10) : null) : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      }
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully.',
      data: { coupon: updated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating coupon.' });
  }
};

// DELETE /api/coupons/:id - Admin: Delete coupon
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.coupon.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Coupon deleted successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting coupon.' });
  }
};
