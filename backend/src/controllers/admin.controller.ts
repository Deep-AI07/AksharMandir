import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { isValidEmail, isValidPhone, isValidPassword, isNonEmptyString } from '../validators/index.js';

const safeParseJson = (data: any, fallback: any = {}) => {
  if (typeof data !== 'string') return data || fallback;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

// GET /api/admin/dashboard - High-level KPIs, charts, and recent activity
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Core KPIs
    const [
      totalOrders,
      pendingOrdersCount,
      totalCustomers,
      totalProducts,
      outOfStockProducts,
      allOrders,
      recentOrders,
      recentCustomers
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: 0 } }),
      prisma.order.findMany({
        where: { paymentStatus: { in: ['SUCCESS', 'PENDING'] } },
        select: { total: true, createdAt: true, paymentMethod: true, orderStatus: true }
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true }
      }),
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, phone: true, createdAt: true }
      })
    ]);

    const totalSales = allOrders.reduce((sum, o) => sum + o.total, 0);

    // Today's Sales
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfToday);
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

    // Monthly Sales Breakdown (Last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: { [key: string]: { sales: number; orders: number } } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]}`;
      monthlyMap[key] = { sales: 0, orders: 0 };
    }

    allOrders.forEach(o => {
      const orderDate = new Date(o.createdAt);
      const key = monthNames[orderDate.getMonth()];
      if (monthlyMap[key]) {
        monthlyMap[key].sales += o.total;
        monthlyMap[key].orders += 1;
      }
    });

    const salesOverview = Object.keys(monthlyMap).map(month => ({
      month,
      sales: monthlyMap[month].sales,
      orders: monthlyMap[month].orders,
    }));

    // Payment Method Breakdown
    const paymentMethods: { [key: string]: number } = {
      UPI: 0,
      QR: 0,
      CARD: 0,
      COD: 0,
    };
    allOrders.forEach(o => {
      let m = o.paymentMethod.toUpperCase();
      if (m.includes('QR')) m = 'QR';
      else if (m.includes('CARD')) m = 'CARD';
      else if (m.includes('CASH') || m.includes('COD')) m = 'COD';
      else m = 'UPI';

      paymentMethods[m] = (paymentMethods[m] || 0) + o.total;
    });

    // Best Selling Products
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId', 'title'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const bestSellers = orderItems.map(item => ({
      productId: item.productId,
      title: item.title,
      totalSold: item._sum.quantity || 0,
    }));

    res.json({
      success: true,
      data: {
        kpi: {
          totalSales,
          todaySales,
          totalOrders,
          pendingOrders: pendingOrdersCount,
          totalCustomers,
          totalProducts,
          outOfStockProducts,
        },
        salesOverview,
        paymentMethodsBreakdown: [
          { method: 'UPI', amount: paymentMethods.UPI },
          { method: 'Sacred QR', amount: paymentMethods.QR },
          { method: 'Card', amount: paymentMethods.CARD },
          { method: 'COD', amount: paymentMethods.COD },
        ],
        recentOrders: recentOrders.map(o => ({
          ...o,
          addressSnapshot: safeParseJson(o.addressSnapshot),
        })),
        recentCustomers,
        bestSellers,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching dashboard metrics.' });
  }
};

// GET /api/admin/reports - Detailed sales reports (daily, weekly, monthly, yearly)
export const getSalesReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'monthly' } = req.query;

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'asc' },
      include: { items: { include: { product: { include: { category: true } } } } }
    });

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    // Time-based aggregation
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const todaySales = orders.filter(o => new Date(o.createdAt) >= startOfToday).reduce((s, o) => s + o.total, 0);
    const weeklySales = orders.filter(o => new Date(o.createdAt) >= startOfWeek).reduce((s, o) => s + o.total, 0);
    const monthlySales = orders.filter(o => new Date(o.createdAt) >= startOfMonth).reduce((s, o) => s + o.total, 0);
    const yearlySales = orders.filter(o => new Date(o.createdAt) >= startOfYear).reduce((s, o) => s + o.total, 0);

    // Best selling categories
    const categorySalesMap: { [key: string]: { name: string; amount: number; count: number } } = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const catName = item.product?.category?.name || 'Traditional Mandirs';
        if (!categorySalesMap[catName]) {
          categorySalesMap[catName] = { name: catName, amount: 0, count: 0 };
        }
        categorySalesMap[catName].amount += item.price * item.quantity;
        categorySalesMap[catName].count += item.quantity;
      });
    });

    const categoryBreakdown = Object.values(categorySalesMap).sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        summary: {
          todaySales,
          weeklySales,
          monthlySales,
          yearlySales,
          totalSales,
          totalOrders,
        },
        categoryBreakdown,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching sales reports.' });
  }
};

// GET /api/admin/customers - List customers and admin users with order stats & permissions
export const getAdminCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, page = '1', limit = '50' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 50);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (search && (search as string).trim() !== '') {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            select: { id: true, total: true, createdAt: true, orderNumber: true, orderStatus: true },
            orderBy: { createdAt: 'desc' }
          },
          addresses: true,
        }
      }),
      prisma.user.count({ where })
    ]);

    const formattedCustomers = customers.map(c => {
      const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0);
      const lastOrder = c.orders.length > 0 ? c.orders[0] : null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        preferredDeity: c.preferredDeity,
        totalOrders: c.orders.length,
        totalSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
        lastOrderNumber: lastOrder ? lastOrder.orderNumber : null,
        addresses: c.addresses,
        joinedAt: c.createdAt,
      };
    });

    res.json({
      success: true,
      data: {
        customers: formattedCustomers,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching customers.' });
  }
};

// POST /api/admin/customers - Admin creates a new customer or admin account
export const createAdminCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role = 'CUSTOMER' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    if (!isNonEmptyString(name, 2, 80)) {
      res.status(400).json({ success: false, message: 'Full name must be between 2 and 80 characters.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, message: passwordValidation.message });
      return;
    }

    if (phone && !isValidPhone(phone)) {
      res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      res.status(409).json({ success: false, message: `An account with email "${cleanEmail}" already exists.` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRole = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: validRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    res.status(201).json({
      success: true,
      message: `Account "${newUser.name}" (${newUser.role}) created successfully!`,
      data: { customer: newUser }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create customer.' });
  }
};

// PUT /api/admin/customers/:id - Admin updates customer details, password, and permissions/role
export const updateAdminCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ success: false, message: 'Customer account not found.' });
      return;
    }

    const dataToUpdate: any = {};
    if (name !== undefined) {
      if (!isNonEmptyString(name, 2, 80)) {
        res.status(400).json({ success: false, message: 'Full name must be between 2 and 80 characters.' });
        return;
      }
      dataToUpdate.name = name.trim();
    }

    if (phone !== undefined) {
      if (phone && phone.trim() !== '' && !isValidPhone(phone)) {
        res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
        return;
      }
      dataToUpdate.phone = phone ? phone.trim() : null;
    }

    if (role && (role === 'CUSTOMER' || role === 'ADMIN')) dataToUpdate.role = role;

    if (email && email.toLowerCase().trim() !== existingUser.email.toLowerCase()) {
      const cleanEmail = email.toLowerCase().trim();
      if (!isValidEmail(cleanEmail)) {
        res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        return;
      }
      const conflict = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (conflict) {
        res.status(409).json({ success: false, message: `Email "${cleanEmail}" is already in use by another account.` });
        return;
      }
      dataToUpdate.email = cleanEmail;
    }

    if (password && password.trim() !== '') {
      const passwordValidation = isValidPassword(password.trim());
      if (!passwordValidation.valid) {
        res.status(400).json({ success: false, message: passwordValidation.message });
        return;
      }
      dataToUpdate.passwordHash = await bcrypt.hash(password.trim(), 10);
    }


    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      success: true,
      message: `Account "${updatedUser.name}" updated successfully (Role: ${updatedUser.role})!`,
      data: { customer: updatedUser }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update customer.' });
  }
};

// DELETE /api/admin/customers/:id - Admin deletes a customer or user account
export const deleteAdminCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentAdminId = (req as any).user?.id;

    if (currentAdminId && currentAdminId === id) {
      res.status(400).json({ success: false, message: 'Security restriction: You cannot delete your own logged-in admin account.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Account not found.' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: `Account "${targetUser.name}" (${targetUser.email}) removed successfully!`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete account.' });
  }
};
