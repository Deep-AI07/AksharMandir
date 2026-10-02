import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// GET /api/products - Public listing with rich search & multi-faceted filtering
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category, // slug or id
      material,
      mounting,
      finish,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      isBestseller,
      isNew,
      status,
      sortBy = 'featured',
      page = '1',
      limit = '20',
      includeAllStatus = 'false'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};

    // By default, public only sees ACTIVE products unless admin requests all
    if (includeAllStatus === 'true') {
      if (status) {
        where.status = status as string;
      }
    } else {
      where.status = 'ACTIVE';
    }

    // Keyword Search across title, SKU, material, and full description
    if (search && (search as string).trim() !== '') {
      const q = (search as string).trim();
      where.OR = [
        { title: { contains: q } },
        { sku: { contains: q } },
        { material: { contains: q } },
        { shortDescription: { contains: q } },
        { fullDescription: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // Category filter
    if (category && (category as string).trim() !== '' && category !== 'All') {
      where.category = {
        OR: [
          { slug: category as string },
          { id: category as string },
          { name: { contains: category as string } }
        ]
      };
    }

    // Material filter
    if (material && (material as string).trim() !== '' && material !== 'All') {
      where.material = { contains: material as string };
    }

    // Mounting Type filter
    if (mounting && (mounting as string).trim() !== '' && mounting !== 'All') {
      where.mountingType = { contains: mounting as string };
    }

    // Finish filter
    if (finish && (finish as string).trim() !== '' && finish !== 'All') {
      where.colorFinish = { contains: finish as string };
    }

    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    // Stock availability
    if (inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    }

    // Flags
    if (isFeatured === 'true') where.isFeatured = true;
    if (isBestseller === 'true') where.isBestseller = true;
    if (isNew === 'true') where.isNew = true;

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    else if (sortBy === 'rating') orderBy = { rating: 'desc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    else if (sortBy === 'featured') orderBy = [{ isFeatured: 'desc' }, { isBestseller: 'desc' }, { createdAt: 'desc' }];

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          images: {
            orderBy: { displayOrder: 'asc' }
          },
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Format products with parsed JSON arrays for client ease
    const formattedProducts = products.map(p => ({
      ...p,
      features: p.features ? JSON.parse(p.features) : [],
      tags: p.tags ? JSON.parse(p.tags) : [],
      availableFinishes: p.availableFinishes ? JSON.parse(p.availableFinishes) : [p.colorFinish],
      inStock: p.stockQuantity > 0,
      images: Array.isArray(p.images) ? p.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching products.' });
  }
};

// GET /api/products/:slug - Public: Get single product by slug or ID
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }
        ]
      },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            userName: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
          }
        }
      }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Mandir product not found.' });
      return;
    }

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'ACTIVE',
      },
      take: 4,
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
      }
    });

    const formattedProduct = {
      ...product,
      features: product.features ? JSON.parse(product.features) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      availableFinishes: product.availableFinishes ? JSON.parse(product.availableFinishes) : [product.colorFinish],
      inStock: product.stockQuantity > 0,
      images: Array.isArray(product.images) ? product.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
      relatedProducts: relatedProducts.map(rp => ({
        ...rp,
        features: rp.features ? JSON.parse(rp.features) : [],
        tags: rp.tags ? JSON.parse(rp.tags) : [],
        availableFinishes: rp.availableFinishes ? JSON.parse(rp.availableFinishes) : [rp.colorFinish],
        inStock: rp.stockQuantity > 0,
        images: Array.isArray(rp.images) ? rp.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
      }))
    };

    res.json({
      success: true,
      data: { product: formattedProduct }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching product details.' });
  }
};

// POST /api/products - Admin: Create new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      categoryId,
      sku,
      price,
      originalPrice,
      stockQuantity,
      material,
      dimensions,
      mountingType,
      colorFinish,
      availableFinishes,
      weight,
      warranty,
      shortDescription,
      fullDescription,
      features,
      vastuNotes,
      tags,
      isFeatured,
      isBestseller,
      isNew,
      status = 'ACTIVE',
      images = []
    } = req.body;

    if (!title || !categoryId || price === undefined) {
      res.status(400).json({ success: false, message: 'Title, Category, and Price are required.' });
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ success: false, message: 'Price must be a valid positive number.' });
      return;
    }

    const parsedStock = stockQuantity !== undefined ? parseInt(stockQuantity, 10) : 0;
    if (isNaN(parsedStock) || parsedStock < 0) {
      res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
      return;
    }

    let slug = slugify(title);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const autoSku = sku || `AKM-${slug.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const numOrigPrice = originalPrice ? parseFloat(originalPrice) : numPrice;
    const discount = numOrigPrice > numPrice ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100) : 0;

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug,
        sku: autoSku,
        categoryId,
        price: numPrice,
        originalPrice: numOrigPrice,
        discountPercentage: discount,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        material: material || 'Teak Wood',
        dimensions: dimensions || '36"W x 20"D x 48"H',
        mountingType: mountingType || 'Floor Rested',
        colorFinish: colorFinish || 'Natural Teak Polish',
        availableFinishes: Array.isArray(availableFinishes) 
          ? JSON.stringify(availableFinishes) 
          : JSON.stringify([colorFinish || 'Natural Teak Polish']),
        weight: weight || '35 kg',
        warranty: warranty || '5 Years Structural',
        shortDescription: shortDescription || 'Handcrafted Sacred Mandir',
        fullDescription: fullDescription || 'Exquisitely hand-carved sacred mandir temple.',
        features: Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([]),
        vastuNotes: vastuNotes || 'Constructed aligned with Vastu Shastra principles.',
        tags: Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]),
        isFeatured: Boolean(isFeatured),
        isBestseller: Boolean(isBestseller),
        isNew: Boolean(isNew),
        status: status || 'ACTIVE',
        images: {
          create: Array.isArray(images) && images.length > 0
            ? images.map((url: string, idx: number) => ({
                url,
                displayOrder: idx,
                isPrimary: idx === 0,
                altText: `${title} view ${idx + 1}`
              }))
            : [{
                url: '/images/mandirs/mandir_royal_sheesham.jpg',
                displayOrder: 0,
                isPrimary: true,
                altText: title
              }]
        }
      },
      include: {
        category: true,
        images: true
      }
    });

    const formattedCreated = {
      ...product,
      features: product.features ? JSON.parse(product.features) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      availableFinishes: product.availableFinishes ? JSON.parse(product.availableFinishes) : [product.colorFinish],
      inStock: product.stockQuantity > 0,
      images: Array.isArray(product.images) ? product.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product: formattedCreated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating product.' });
  }
};

// PUT /api/products/:id - Admin: Update product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      categoryId,
      sku,
      price,
      originalPrice,
      stockQuantity,
      material,
      dimensions,
      mountingType,
      colorFinish,
      availableFinishes,
      weight,
      warranty,
      shortDescription,
      fullDescription,
      features,
      vastuNotes,
      tags,
      isFeatured,
      isBestseller,
      isNew,
      status,
      images
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    let numPrice = existing.price;
    if (price !== undefined) {
      const p = parseFloat(price);
      if (isNaN(p) || p <= 0) {
        res.status(400).json({ success: false, message: 'Price must be a valid positive number.' });
        return;
      }
      numPrice = p;
    }

    let parsedStockQuantity = undefined;
    if (stockQuantity !== undefined) {
      const sq = parseInt(stockQuantity, 10);
      if (isNaN(sq) || sq < 0) {
        res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
        return;
      }
      parsedStockQuantity = sq;
    }

    let numOrigPrice = originalPrice !== undefined ? parseFloat(originalPrice) : (existing.originalPrice || numPrice);
    let discount = numOrigPrice > numPrice ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100) : 0;

    let newSlug = undefined;
    if (title && title !== existing.title) {
      newSlug = slugify(title);
      const slugConflict = await prisma.product.findFirst({ where: { slug: newSlug, NOT: { id } } });
      if (slugConflict) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Handle image updates if array is provided
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((url: string, idx: number) => ({
          productId: id,
          url,
          displayOrder: idx,
          isPrimary: idx === 0,
          altText: `${title || existing.title} view ${idx + 1}`
        }))
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        slug: newSlug,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        sku: sku !== undefined ? sku.trim() : undefined,
        price: numPrice,
        originalPrice: numOrigPrice,
        discountPercentage: discount,
        stockQuantity: parsedStockQuantity,
        material: material !== undefined ? material : undefined,
        dimensions: dimensions !== undefined ? dimensions : undefined,
        mountingType: mountingType !== undefined ? mountingType : undefined,
        colorFinish: colorFinish !== undefined ? colorFinish : undefined,
        availableFinishes: availableFinishes !== undefined
          ? Array.isArray(availableFinishes) ? JSON.stringify(availableFinishes) : availableFinishes
          : undefined,
        weight: weight !== undefined ? weight : undefined,
        warranty: warranty !== undefined ? warranty : undefined,
        shortDescription: shortDescription !== undefined ? shortDescription : undefined,
        fullDescription: fullDescription !== undefined ? fullDescription : undefined,
        features: features !== undefined
          ? Array.isArray(features) ? JSON.stringify(features) : features
          : undefined,
        vastuNotes: vastuNotes !== undefined ? vastuNotes : undefined,
        tags: tags !== undefined
          ? Array.isArray(tags) ? JSON.stringify(tags) : tags
          : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isBestseller: isBestseller !== undefined ? Boolean(isBestseller) : undefined,
        isNew: isNew !== undefined ? Boolean(isNew) : undefined,
        status: status !== undefined ? status : undefined,
      },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } }
      }
    });

    const formattedUpdated = {
      ...updated,
      features: updated.features ? JSON.parse(updated.features) : [],
      tags: updated.tags ? JSON.parse(updated.tags) : [],
      availableFinishes: updated.availableFinishes ? JSON.parse(updated.availableFinishes) : [updated.colorFinish],
      inStock: updated.stockQuantity > 0,
      images: Array.isArray(updated.images) ? updated.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
    };

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: { product: formattedUpdated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating product.' });
  }
};

// PATCH /api/products/:id/status - Admin: Fast status toggle (ACTIVE, INACTIVE, DRAFT, COMING_SOON)
export const updateProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'DRAFT', 'COMING_SOON'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid product status.' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: `Product status updated to ${status}.`,
      data: { product: updated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating product status.' });
  }
};

// PATCH /api/products/:id/stock - Admin: Fast stock update
export const updateProductStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;

    const qty = parseInt(stockQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      res.status(400).json({ success: false, message: 'Invalid stock quantity. Must be >= 0.' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stockQuantity: qty }
    });

    res.json({
      success: true,
      message: `Stock updated to ${qty}.`,
      data: { product: updated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating stock.' });
  }
};

// DELETE /api/products/:id - Admin: Delete product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if product is in any past orders
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemsCount > 0) {
      // Safe handling: if ordered before, archive/deactivate rather than breaking foreign key
      await prisma.product.update({
        where: { id },
        data: { status: 'INACTIVE' }
      });
      res.json({
        success: true,
        message: 'Product has order history. It has been set to INACTIVE to preserve audit records.'
      });
      return;
    }

    await prisma.product.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting product.' });
  }
};
