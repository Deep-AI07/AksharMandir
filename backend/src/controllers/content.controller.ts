import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

// GET /api/content/public - Public: Get all active website sections & public settings
export const getPublicContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const [sections, settings] = await Promise.all([
      prisma.websiteContent.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.storeSetting.findMany({
        where: { isPublic: true }
      })
    ]);

    const formattedSections = sections.reduce((acc: any, sec) => {
      acc[sec.sectionKey] = {
        title: sec.title,
        subtitle: sec.subtitle,
        content: sec.contentJson ? JSON.parse(sec.contentJson) : null,
        imageUrl: sec.imageUrl,
        linkUrl: sec.linkUrl,
      };
      return acc;
    }, {});

    const formattedSettings = settings.reduce((acc: any, s) => {
      try {
        acc[s.key] = JSON.parse(s.value);
      } catch {
        acc[s.key] = s.value;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        sections: formattedSections,
        settings: formattedSettings,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching website content.' });
  }
};

// GET /api/admin/content - Admin: List all content sections
export const getAdminContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const sections = await prisma.websiteContent.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    res.json({
      success: true,
      data: { sections }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching admin content.' });
  }
};

// POST /api/admin/content - Admin: Upsert content section
export const upsertContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sectionKey, title, subtitle, content, imageUrl, linkUrl, isActive = true, displayOrder = 0 } = req.body;

    if (!sectionKey) {
      res.status(400).json({ success: false, message: 'sectionKey is required.' });
      return;
    }

    const contentJson = content ? JSON.stringify(content) : null;

    const upserted = await prisma.websiteContent.upsert({
      where: { sectionKey },
      update: {
        title: title !== undefined ? title : undefined,
        subtitle: subtitle !== undefined ? subtitle : undefined,
        contentJson: contentJson !== null ? contentJson : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        linkUrl: linkUrl !== undefined ? linkUrl : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : undefined,
      },
      create: {
        sectionKey,
        title,
        subtitle,
        contentJson,
        imageUrl,
        linkUrl,
        isActive: Boolean(isActive),
        displayOrder: parseInt(displayOrder, 10) || 0,
      }
    });

    res.json({
      success: true,
      message: 'Website content updated.',
      data: { section: upserted }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating website content.' });
  }
};

// GET /api/admin/settings - Admin: Get all settings
export const getAdminSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.storeSetting.findMany();
    const formatted = settings.reduce((acc: any, s) => {
      try {
        acc[s.key] = JSON.parse(s.value);
      } catch {
        acc[s.key] = s.value;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: { settings: formatted }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching store settings.' });
  }
};

// POST /api/admin/settings - Admin: Update store settings
export const updateAdminSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, description, isPublic = false } = req.body;

    if (!key || value === undefined) {
      res.status(400).json({ success: false, message: 'Key and value are required.' });
      return;
    }

    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

    const setting = await prisma.storeSetting.upsert({
      where: { key },
      update: {
        value: valueStr,
        description: description !== undefined ? description : undefined,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : undefined,
      },
      create: {
        key,
        value: valueStr,
        description,
        isPublic: Boolean(isPublic),
      }
    });

    res.json({
      success: true,
      message: `Setting ${key} updated successfully.`,
      data: { setting }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating settings.' });
  }
};
