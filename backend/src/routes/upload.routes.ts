import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/upload/image - Upload a single image (e.g. for custom mandir reference or admin product)
router.post('/image', upload.single('image'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded.' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error uploading image.' });
  }
});

// POST /api/upload/multiple - Upload multiple images (admin only)
router.post('/multiple', requireAdmin, upload.array('images', 10), (req: Request, res: Response): void => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No images uploaded.' });
      return;
    }

    const uploadedUrls = files.map(f => `/uploads/${f.filename}`);

    res.json({
      success: true,
      message: `${files.length} images uploaded successfully.`,
      data: {
        urls: uploadedUrls,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error uploading images.' });
  }
});

export default router;
