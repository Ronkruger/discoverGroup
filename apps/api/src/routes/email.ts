import express, { Request, Response } from 'express';
import { sendBookingConfirmationEmail } from '../services/emailService';

const router = express.Router();

interface BookingEmailRequest {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  tourTitle: string;
  tourDate: string;
  passengers: number;
  pricePerPerson: number;
  totalAmount: number;
  country?: string;
  downpaymentAmount?: number;
  remainingBalance?: number;
  isDownpaymentOnly?: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentPurpose?: string;
  paymentMethod?: string;
  paymentMethodDescription?: string;
  paymentMethodIcon?: string;
  paymentGateway?: string;
}

// POST /api/send-booking-email
router.post('/send-booking-email', async (req: Request, res: Response) => {
  try {
    const {
      bookingId,
      customerName,
      customerEmail,
      tourTitle,
      tourDate,
      passengers,
      pricePerPerson,
      totalAmount,
      country,
      downpaymentAmount,
      remainingBalance,
      isDownpaymentOnly,
      appointmentDate,
      appointmentTime,
      appointmentPurpose,
      paymentMethod,
      paymentMethodDescription,
      paymentMethodIcon,
      paymentGateway
    }: BookingEmailRequest = req.body;

    // Validate required fields
    if (!bookingId || !customerName || !customerEmail || !tourTitle || !tourDate || !passengers || !pricePerPerson || !totalAmount) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['bookingId', 'customerName', 'customerEmail', 'tourTitle', 'tourDate', 'passengers', 'pricePerPerson', 'totalAmount']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Send the email
    const result = await sendBookingConfirmationEmail({
      bookingId,
      customerName,
      customerEmail,
      tourTitle,
      tourDate,
      passengers,
      pricePerPerson,
      totalAmount,
      country,
      downpaymentAmount,
      remainingBalance,
      isDownpaymentOnly,
      appointmentDate,
      appointmentTime,
      appointmentPurpose,
      paymentMethod,
      paymentMethodDescription,
      paymentMethodIcon,
      paymentGateway
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Booking confirmation email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl // Only available in development
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Email API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;