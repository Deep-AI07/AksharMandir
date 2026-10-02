import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { isValidEmail, isValidPhone, isValidPincode, isPositiveNumber, isNonEmptyString, isNonNegativeNumber } from '../validators/index.js';

// POST /api/custom-orders - Customer: Submit custom mandir request
export const submitCustomOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || null;
    const {
      fullName,
      phone,
      email,
      city,
      pincode,
      width,
      depth,
      height,
      unit = 'Inches',
      materialPreference,
      finishType,
      mounting,
      features, // array of strings
      engravingRequirements,
      additionalRequirements,
      referenceImageUrl,
      estimatedQuote,
    } = req.body;

    if (!fullName || !phone || !email || !width || !height) {
      res.status(400).json({ success: false, message: 'Contact details and dimensions are required.' });
      return;
    }

    if (!isNonEmptyString(fullName, 2, 80)) {
      res.status(400).json({ success: false, message: 'Full name must be between 2 and 80 characters.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (!isValidPhone(phone)) {
      res.status(400).json({ success: false, message: 'Please provide a valid contact phone number.' });
      return;
    }

    if (!isPositiveNumber(width) || !isPositiveNumber(height)) {
      res.status(400).json({ success: false, message: 'Width and height must be positive numbers.' });
      return;
    }

    if (depth && !isPositiveNumber(depth)) {
      res.status(400).json({ success: false, message: 'Depth must be a positive number.' });
      return;
    }

    if (pincode && !isValidPincode(pincode)) {
      res.status(400).json({ success: false, message: 'Please enter a valid postal pincode.' });
      return;
    }

    const timestamp = new Date().getFullYear();
    const randomCode = Math.floor(100 + Math.random() * 900);
    const requestNumber = `AKM-REQ-${timestamp}-${randomCode}`;

    const numQuote = estimatedQuote ? parseFloat(estimatedQuote) : 0;

    const customOrder = await prisma.customOrder.create({
      data: {
        requestNumber,
        userId,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.toLowerCase().trim(),
        city: city ? city.trim() : 'India',
        pincode: pincode ? pincode.trim() : '000000',
        width: String(width),
        depth: String(depth || '18'),
        height: String(height),
        unit: unit || 'Inches',
        materialPreference: materialPreference || 'Teak Wood',
        finishType: finishType || 'Antique Honey',
        mounting: mounting || 'Floor Rested',
        featuresJson: Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([]),
        engravingRequirements: engravingRequirements || null,
        additionalRequirements: additionalRequirements || null,
        referenceImageUrl: referenceImageUrl || null,
        estimatedQuote: numQuote,
        advanceAmount: numQuote > 0 ? Math.round(numQuote * 0.3) : 0,
        remainingAmount: numQuote > 0 ? Math.round(numQuote * 0.7) : 0,
        status: 'PENDING_REVIEW',
      }
    });

    res.status(201).json({
      success: true,
      message: 'Custom Mandir consultation request submitted! Our master artisan will review your requirements.',
      data: {
        customOrder: {
          ...customOrder,
          features: JSON.parse(customOrder.featuresJson),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting custom mandir request.' });
  }
};

// GET /api/custom-orders/my-requests - Customer: View my submitted custom mandir requests
export const getMyCustomOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const requests = await prisma.customOrder.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { customerEmail: req.user.email }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { images: true }
    });

    const formatted = requests.map(r => ({
      ...r,
      features: JSON.parse(r.featuresJson),
    }));

    res.json({
      success: true,
      data: { customOrders: formatted }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching custom requests.' });
  }
};

// GET /api/admin/custom-orders - Admin: List all custom mandir requests
export const getAdminCustomOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};
    if (status && status !== 'All') where.status = status as string;

    if (search && (search as string).trim() !== '') {
      const q = (search as string).trim();
      where.OR = [
        { requestNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { customerEmail: { contains: q } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.customOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { images: true }
      }),
      prisma.customOrder.count({ where })
    ]);

    const formatted = requests.map(r => ({
      ...r,
      features: JSON.parse(r.featuresJson),
    }));

    res.json({
      success: true,
      data: {
        customOrders: formatted,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching admin custom orders.' });
  }
};

// PATCH /api/admin/custom-orders/:id/quote - Admin: Update quote, advance, and status
export const updateCustomOrderQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estimatedQuote, advanceAmount, remainingAmount, status, adminNotes } = req.body;

    const existing = await prisma.customOrder.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Custom order request not found.' });
      return;
    }

    if (estimatedQuote !== undefined && !isNonNegativeNumber(estimatedQuote)) {
      res.status(400).json({ success: false, message: 'Estimated quote must be a non-negative number.' });
      return;
    }
    if (advanceAmount !== undefined && !isNonNegativeNumber(advanceAmount)) {
      res.status(400).json({ success: false, message: 'Advance amount must be a non-negative number.' });
      return;
    }
    if (remainingAmount !== undefined && !isNonNegativeNumber(remainingAmount)) {
      res.status(400).json({ success: false, message: 'Remaining amount must be a non-negative number.' });
      return;
    }

    const quote = estimatedQuote !== undefined ? parseFloat(estimatedQuote) : existing.estimatedQuote;
    const advance = advanceAmount !== undefined ? parseFloat(advanceAmount) : (existing.advanceAmount || Math.round(quote * 0.3));
    const remaining = remainingAmount !== undefined ? parseFloat(remainingAmount) : Math.max(0, quote - advance);

    const updated = await prisma.customOrder.update({
      where: { id },
      data: {
        estimatedQuote: quote,
        advanceAmount: advance,
        remainingAmount: remaining,
        status: status || undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      }
    });

    res.json({
      success: true,
      message: 'Custom mandir quotation & status updated.',
      data: {
        customOrder: {
          ...updated,
          features: JSON.parse(updated.featuresJson),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating custom quotation.' });
  }
};
