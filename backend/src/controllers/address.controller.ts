import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { isValidPhone, isValidPincode, isNonEmptyString } from '../validators/index.js';

// GET /api/addresses - List user addresses
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    res.json({
      success: true,
      data: { addresses }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching addresses.' });
  }
};

// POST /api/addresses - Add new address
export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { fullName, phone, streetAddress, apartment, city, state, pincode, type = 'Home', isDefault = false } = req.body;

    if (!fullName || !phone || !streetAddress || !city || !state || !pincode) {
      res.status(400).json({ success: false, message: 'All address fields are required.' });
      return;
    }

    if (!isNonEmptyString(fullName, 2, 80)) {
      res.status(400).json({ success: false, message: 'Full name must be between 2 and 80 characters.' });
      return;
    }

    if (!isValidPhone(phone)) {
      res.status(400).json({ success: false, message: 'Please provide a valid contact phone number.' });
      return;
    }

    if (!isValidPincode(pincode)) {
      res.status(400).json({ success: false, message: 'Please enter a valid postal pincode.' });
      return;
    }

    const addressCount = await prisma.address.count({ where: { userId: req.user.id } });
    const shouldBeDefault = isDefault || addressCount === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        apartment: apartment ? apartment.trim() : null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        type: type || 'Home',
        isDefault: shouldBeDefault,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      data: { address }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error saving address.' });
  }
};

// PUT /api/addresses/:id - Update address
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { fullName, phone, streetAddress, apartment, city, state, pincode, type, isDefault } = req.body;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    if (fullName !== undefined && !isNonEmptyString(fullName, 2, 80)) {
      res.status(400).json({ success: false, message: 'Full name must be between 2 and 80 characters.' });
      return;
    }

    if (phone !== undefined && !isValidPhone(phone)) {
      res.status(400).json({ success: false, message: 'Please provide a valid contact phone number.' });
      return;
    }

    if (pincode !== undefined && !isValidPincode(pincode)) {
      res.status(400).json({ success: false, message: 'Please enter a valid postal pincode.' });
      return;
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        fullName: fullName !== undefined ? fullName.trim() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        streetAddress: streetAddress !== undefined ? streetAddress.trim() : undefined,
        apartment: apartment !== undefined ? (apartment ? apartment.trim() : null) : undefined,
        city: city !== undefined ? city.trim() : undefined,
        state: state !== undefined ? state.trim() : undefined,
        pincode: pincode !== undefined ? pincode.trim() : undefined,
        type: type !== undefined ? type : undefined,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
      }
    });

    res.json({
      success: true,
      message: 'Address updated successfully.',
      data: { address: updated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating address.' });
  }
};

// DELETE /api/addresses/:id - Delete address
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    await prisma.address.delete({ where: { id } });

    // If was default, set another address as default if exists
    if (existing.isDefault) {
      const another = await prisma.address.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
      if (another) {
        await prisma.address.update({
          where: { id: another.id },
          data: { isDefault: true }
        });
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting address.' });
  }
};

// PATCH /api/addresses/:id/default - Set default
export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
      return;
    }

    await prisma.address.updateMany({
      where: { userId: req.user.id },
      data: { isDefault: false }
    });

    const updated = await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });

    res.json({
      success: true,
      message: 'Default address updated.',
      data: { address: updated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error setting default address.' });
  }
};
