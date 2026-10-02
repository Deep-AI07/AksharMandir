import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { mergeGuestCart } from './cart.controller.js';
import { mergeGuestWishlist } from './wishlist.controller.js';
import { isValidEmail, isValidPassword, isValidPhone, isNonEmptyString } from '../validators/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'akshar_mandir_divine_jwt_secret_key_2026_vedic_craft';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user: { id: string; email: string; role: string; name: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: (JWT_EXPIRES_IN || '7d') as any }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, preferredDeity } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    if (!isNonEmptyString(name, 2, 80)) {
      res.status(400).json({ success: false, message: 'Full name must be between 2 and 80 characters.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, message: passwordValidation.message });
      return;
    }

    if (phone && !isValidPhone(phone)) {
      res.status(400).json({ success: false, message: 'Please enter a valid contact phone number.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone ? phone.trim() : null,
        preferredDeity: preferredDeity || null,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        preferredDeity: true,
        createdAt: true,
      }
    });

    // Merge guest cart and guest wishlist
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;
    if (sessionId) {
      await mergeGuestCart(newUser.id, sessionId);
      await mergeGuestWishlist(newUser.id, sessionId);
    }

    // Auto-link past guest orders created with this email
    await prisma.order.updateMany({
      where: {
        userId: null,
        customerEmail: newUser.email.toLowerCase().trim()
      },
      data: {
        userId: newUser.id
      }
    }).catch(err => console.warn('Could not link past orders on register:', err));

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Akshar Mandir.',
      data: {
        user: newUser,
        token,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating account.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        addresses: true
      }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      return;
    }

    // Merge guest cart and guest wishlist
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;
    if (sessionId) {
      await mergeGuestCart(user.id, sessionId);
      await mergeGuestWishlist(user.id, sessionId);
    }

    // Auto-link past guest orders created with this email
    await prisma.order.updateMany({
      where: {
        userId: null,
        customerEmail: user.email.toLowerCase().trim()
      },
      data: {
        userId: user.id
      }
    }).catch(err => console.warn('Could not link past orders on login:', err));

    const token = generateToken(user);

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: userWithoutPassword,
        token,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error logging in.' });
  }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Admin email and password are required.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, message: 'Please enter a valid administrator email.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied: Invalid administrator credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Admin authorization successful.',
      data: {
        user: userWithoutPassword,
        token,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error logging into admin panel.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        preferredDeity: true,
        addresses: true,
        createdAt: true,
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching user profile.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, email, phone, preferredDeity, avatarUrl } = req.body;

    if (name !== undefined && !isNonEmptyString(name, 2, 80)) {
      res.status(400).json({ success: false, message: 'Full name must be between 2 and 80 characters.' });
      return;
    }

    let cleanEmail: string | undefined = undefined;
    if (email !== undefined && email.trim()) {
      if (!isValidEmail(email)) {
        res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        return;
      }
      cleanEmail = email.trim().toLowerCase();
      // Check if another user with same email exists
      const existingUser = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          NOT: { id: req.user.id }
        }
      });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'This email is already in use by another account.' });
        return;
      }
    }

    if (phone !== undefined && phone.trim() !== '' && !isValidPhone(phone)) {
      res.status(400).json({ success: false, message: 'Please provide a valid contact phone number.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        email: cleanEmail !== undefined ? cleanEmail : undefined,
        phone: phone !== undefined ? (phone.trim() || null) : undefined,
        preferredDeity: preferredDeity !== undefined ? preferredDeity.trim() : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        preferredDeity: true,
        addresses: true,
        createdAt: true,
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating profile.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current and new password are required.' });
      return;
    }

    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, message: passwordValidation.message });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({ success: false, message: 'New password must be different from current password.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password does not match.' });
      return;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error changing password.' });
  }
};
