import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

// Helper to generate a clean URL slug
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// GET /api/categories - Public: Get all active categories with product counts
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeInactive } = req.query;

    const where = includeInactive === 'true' ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching categories.' });
  }
};

// GET /api/categories/:slug - Public: Get single category by slug or ID
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }
        ]
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      res.status(404).json({ success: false, message: 'Mandir category not found.' });
      return;
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching category.' });
  }
};

// POST /api/categories - Admin: Create a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image, badge, orderIndex, isActive } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    let slug = slugify(name);
    // Ensure slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const categoryCount = await prisma.category.count();

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description ? description.trim() : null,
        image: image || '/images/mandirs/mandir_royal_sheesham.jpg',
        badge: badge ? badge.trim() : null,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : categoryCount + 1,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating category.' });
  }
};

// PUT /api/categories/:id - Admin: Update category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image, badge, orderIndex, isActive } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    let newSlug = undefined;
    if (name && name !== existing.name) {
      newSlug = slugify(name);
      const slugConflict = await prisma.category.findFirst({
        where: { slug: newSlug, NOT: { id } }
      });
      if (slugConflict) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        slug: newSlug,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
        badge: badge !== undefined ? badge : undefined,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: { category: updated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating category.' });
  }
};

// DELETE /api/categories/:id - Admin: Safe delete or deactivate category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { targetCategoryId } = req.body; // Optional category to reassign products to

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    if (category._count.products > 0) {
      if (targetCategoryId && targetCategoryId !== id) {
        // Reassign products to target category first
        await prisma.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: targetCategoryId }
        });
      } else {
        // Safe handling: if products exist and no target provided, deactivate instead of breaking relations
        await prisma.category.update({
          where: { id },
          data: { isActive: false }
        });

        res.json({
          success: true,
          message: `Category has ${category._count.products} products attached. It has been deactivated safely to preserve product integrity.`
        });
        return;
      }
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting category.' });
  }
};

// POST /api/categories/reorder - Admin: Update category display orders
export const reorderCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderedIds } = req.body; // Array of category IDs in new order

    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ success: false, message: 'orderedIds array required.' });
      return;
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { orderIndex: index + 1 }
        })
      )
    );

    res.json({
      success: true,
      message: 'Categories reordered successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error reordering categories.' });
  }
};
