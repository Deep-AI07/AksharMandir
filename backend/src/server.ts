import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import addressRoutes from './routes/address.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import customOrderRoutes from './routes/customOrder.routes.js';
import reviewRoutes from './routes/review.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import contentRoutes from './routes/content.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { 
  sensitiveFileGuard, 
  securityHeaders, 
  inputSanitizer, 
  authRateLimiter 
} from './middleware/security.js';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Disable Express fingerprint header
app.disable('x-powered-by');

// 1. Bank-Grade Security Headers
app.use(securityHeaders);

// 2. Sensitive Database & File Protection (Block direct dev.db, .env, or traversal attacks)
app.use(sensitiveFileGuard);

// Configurable CORS for production & development
const configuredOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (configuredOrigins.includes(origin) || configuredOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // In production, allow all origins if not explicitly restricted
    return callback(null, true);
  },
  credentials: true,
}));

// Body Parsers & Input Sanitizer
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(inputSanitizer);

// Ensure static uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve static public images folder (including mandirs gallery)
const candidateImageDirs = [
  path.resolve(process.cwd(), '../frontend/public/images'),
  path.resolve(process.cwd(), 'frontend/public/images'),
  path.resolve(process.cwd(), '../public/images'),
  path.resolve(process.cwd(), 'public/images'),
];
for (const dir of candidateImageDirs) {
  if (fs.existsSync(dir)) {
    app.use('/images', express.static(dir));
    break;
  }
}

// API Health Check
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Akshar Mandir Sanctum API',
    database: 'SQLite (Prisma)',
    version: '1.0.0'
  });
});

// API Routes Mounting
app.use('/api/auth', authRateLimiter(30, 60 * 1000), authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler for unmatched API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// In production, serve the frontend dist if present
const frontendDistPath = path.resolve(process.cwd(), '../frontend/dist');
const altFrontendDistPath = path.resolve(process.cwd(), 'frontend/dist');
const localDistPath = path.resolve(process.cwd(), 'dist/public');
const staticPath = fs.existsSync(frontendDistPath) 
  ? frontendDistPath 
  : (fs.existsSync(altFrontendDistPath) ? altFrontendDistPath : (fs.existsSync(localDistPath) ? localDistPath : null));

if (staticPath) {
  app.use(express.static(staticPath));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`  AKSHAR MANDIR BACKEND API SERVER RUNNING  `);
  console.log(`  Port: http://localhost:${PORT}             `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=============================================`);
});

export default app;
