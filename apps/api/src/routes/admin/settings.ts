import express from 'express';
import { requireAdmin } from '../../middleware/auth';

const router = express.Router();

// In-memory storage for settings (you can replace this with MongoDB if needed)
const adminSettings = {
  bookingDepartmentEmail: process.env.BOOKING_DEPT_EMAIL || 'booking@discovergrp.com',
  emailFromAddress: process.env.SENDGRID_FROM_EMAIL || 'traveldesk@discovergrp.com',
  emailFromName: process.env.SENDGRID_FROM_NAME || 'Discover Group Travel Desk',
};

// GET /admin/settings - Get all settings
router.get('/', requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      settings: adminSettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

// PUT /admin/settings - Update settings
router.put('/', requireAdmin, async (req, res) => {
  try {
    const { bookingDepartmentEmail, emailFromAddress, emailFromName } = req.body;

    // Update settings
    if (bookingDepartmentEmail) {
      adminSettings.bookingDepartmentEmail = bookingDepartmentEmail;
    }
    if (emailFromAddress) {
      adminSettings.emailFromAddress = emailFromAddress;
    }
    if (emailFromName) {
      adminSettings.emailFromName = emailFromName;
    }

    console.log('✅ Admin settings updated:', adminSettings);

    res.json({
      success: true,
      settings: adminSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

// Export the settings so other modules can use them
export function getBookingDepartmentEmail(): string {
  return adminSettings.bookingDepartmentEmail;
}

export function getEmailFromAddress(): string {
  return adminSettings.emailFromAddress;
}

export function getEmailFromName(): string {
  return adminSettings.emailFromName;
}

export default router;
