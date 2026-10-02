import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

// POST /api/payments/initiate - Initialize payment session for UPI, QR, Card, or COD
export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, paymentMethod, customerName, customerPhone, customerEmail } = req.body;

    if (!amount || !paymentMethod) {
      res.status(400).json({ success: false, message: 'Amount and payment method are required.' });
      return;
    }

    const numAmount = parseFloat(amount);
    const paymentId = `PAY-${paymentMethod.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    // Prepare simulated gateway intent
    let gatewayDetails: any = {
      mode: process.env.PAYMENT_MODE || 'development',
      paymentId,
      amount: numAmount,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    };

    if (paymentMethod === 'UPI') {
      gatewayDetails.vpa = 'aksharmandir@icici';
      gatewayDetails.note = 'Sacred Handcrafted Mandir Order';
    } else if (paymentMethod === 'QR' || paymentMethod === 'QR CODE') {
      gatewayDetails.qrPayload = `upi://pay?pa=aksharmandir@icici&pn=AksharMandir&am=${numAmount}&cu=INR&tn=Sanctum_Order_${paymentId}`;
      gatewayDetails.expiresInSeconds = 600; // 10 mins
    } else if (paymentMethod === 'CARD') {
      gatewayDetails.allowedCards = ['Visa', 'MasterCard', 'RuPay'];
    } else if (paymentMethod === 'COD') {
      gatewayDetails.isCod = true;
      gatewayDetails.pendingVerification = true;
    }

    res.json({
      success: true,
      data: {
        paymentId,
        gatewayDetails,
        isDevelopmentMode: true,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error initiating payment.' });
  }
};

// GET /api/admin/payments - Admin: List all payments with filter & search
export const getAdminPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentMethod, status, search, page = '1', limit = '20' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};

    if (paymentMethod && paymentMethod !== 'All') where.paymentMethod = paymentMethod as string;
    if (status && status !== 'All') where.status = status as string;

    if (search && (search as string).trim() !== '') {
      const q = (search as string).trim();
      where.OR = [
        { paymentId: { contains: q } },
        { transactionRef: { contains: q } },
        { order: { orderNumber: { contains: q } } },
        { order: { customerName: { contains: q } } },
        { order: { customerEmail: { contains: q } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              customerEmail: true,
              customerPhone: true,
              total: true,
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching payments.' });
  }
};
