import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'traveldesk@discovergrp.com';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Discover Group Travel Desk';
const BOOKING_DEPT_EMAIL = process.env.BOOKING_DEPT_EMAIL || 'booking@discovergrp.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully in API');
} else {
  console.warn('⚠️ SendGrid API key not found - email sending will use fallback');
}

interface BookingDetails {
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
}

// Create transporter - using Gmail for real email sending
const createTransporter = async () => {
  // Use Gmail SMTP for sending real emails
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback to Ethereal Email for development testing
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Using Ethereal Email for testing');
  console.log('Test credentials:', testAccount.user, testAccount.pass);
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Generate booking confirmation email HTML
const generateBookingConfirmationEmail = (booking: BookingDetails): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Discover Group</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
        }
        .content { 
            background: #f8fafc; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
        }
        .booking-card { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            margin: 20px 0; 
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 10px 0; 
            border-bottom: 1px solid #e2e8f0; 
        }
        .detail-row:last-child { 
            border-bottom: none; 
        }
        .total { 
            font-weight: bold; 
            font-size: 1.2em; 
            color: #3b82f6; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            color: #64748b; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Booking Confirmed!</h1>
        <p>Thank you for choosing Discover Group for your adventure</p>
    </div>
    
    <div class="content">
        <p>Dear ${booking.customerName},</p>
        
        <p>We're excited to confirm your booking! Your adventure awaits, and we can't wait to help you create unforgettable memories.</p>
        
        <div class="booking-card">
            <h3>📋 Booking Details</h3>
            <div class="detail-row">
                <span><strong>Booking ID:</strong></span>
                <span>${booking.bookingId}</span>
            </div>
            <div class="detail-row">
                <span><strong>Tour:</strong></span>
                <span>${booking.tourTitle}</span>
            </div>
            <div class="detail-row">
                <span><strong>Travel Date:</strong></span>
                <span>${new Date(booking.tourDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
            </div>
            <div class="detail-row">
                <span><strong>Passengers:</strong></span>
                <span>${booking.passengers} ${booking.passengers === 1 ? 'person' : 'people'}</span>
            </div>
            <div class="detail-row">
                <span><strong>Price per person:</strong></span>
                <span>PHP ${booking.pricePerPerson.toLocaleString()}</span>
            </div>
            <div class="detail-row total">
                <span><strong>Total Amount:</strong></span>
                <span>PHP ${booking.totalAmount.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="booking-card">
            <h3>📍 What's Next?</h3>
            <ul>
                <li><strong>Documentation:</strong> Ensure your passport is valid for at least 6 months</li>
                <li><strong>Preparation:</strong> We'll send you a detailed itinerary 2 weeks before departure</li>
                <li><strong>Contact:</strong> Our team will reach out with important travel information</li>
                <li><strong>Cancellation:</strong> Free cancellation up to 30 days before departure</li>
            </ul>
        </div>
        
        <div class="booking-card">
            <h3>📞 Need Help?</h3>
            <p>Our customer service team is here to help:</p>
            <ul>
                <li>📧 Email: <a href="mailto:reservations@discovergroup.com">reservations@discovergroup.com</a></li>
                <li>📱 Phone: +63 02 8555 1234</li>
                <li>🕒 Hours: Monday - Friday, 9:00 AM - 6:00 PM (PHT)</li>
            </ul>
        </div>
        
        <p>Thank you for trusting us with your travel dreams. We're committed to making this an incredible experience!</p>
        
        <p>Safe travels,<br>
        <strong>The Discover Group Team</strong></p>
    </div>
    
    <div class="footer">
        <p>© 2025 Discover Group. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
  `;
};

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format appointment purpose
 */
function formatAppointmentPurpose(purpose?: string): string {
  if (!purpose) return 'Consultation';
  return purpose
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const sendBookingConfirmationEmail = async (booking: BookingDetails): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> => {
  try {
    console.log('📧 Attempting to send booking confirmation email to:', booking.customerEmail);
    console.log('📋 Booking details received:', {
      bookingId: booking.bookingId,
      tourDate: booking.tourDate,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      appointmentPurpose: booking.appointmentPurpose
    });
    
    // Try SendGrid first
    if (SENDGRID_API_KEY && SENDGRID_TEMPLATE_ID) {
      console.log('📧 Using SendGrid for email delivery');
      
      // Format tour date - handle both single dates and date ranges
      let formattedTourDate: string;
      if (booking.tourDate.includes(' - ')) {
        // Handle date range (e.g., "2025-05-13 - 2025-05-27")
        const [startDate, endDate] = booking.tourDate.split(' - ').map(d => d.trim());
        const start = new Date(startDate);
        const end = new Date(endDate);
        formattedTourDate = `${start.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })} - ${end.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}`;
      } else {
        // Handle single date
        formattedTourDate = new Date(booking.tourDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      // Prepare template data
      const templateData = {
        customerName: booking.customerName,
        bookingId: booking.bookingId,
        tourTitle: booking.tourTitle,
        tourDate: formattedTourDate,
        passengers: booking.passengers.toString(),
        pricePerPerson: formatCurrency(booking.pricePerPerson),
        totalAmount: formatCurrency(booking.totalAmount),
        // Optional fields
        ...(booking.downpaymentAmount && {
          downpaymentAmount: formatCurrency(booking.downpaymentAmount),
          remainingBalance: formatCurrency(booking.remainingBalance || 0),
        }),
        ...(booking.appointmentDate && booking.appointmentTime && {
          appointmentDate: new Date(booking.appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          appointmentTime: booking.appointmentTime,
          appointmentPurpose: formatAppointmentPurpose(booking.appointmentPurpose),
        }),
      };

      // Send email to both customer and booking department
      const msg = {
        to: [
          booking.customerEmail, // Customer email
          BOOKING_DEPT_EMAIL     // Booking department email
        ],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME,
        },
        templateId: SENDGRID_TEMPLATE_ID,
        dynamicTemplateData: templateData,
        categories: ['booking-confirmation', 'transactional'],
        customArgs: {
          bookingId: booking.bookingId,
          tourTitle: booking.tourTitle,
        },
      };

      console.log('📤 Sending email via SendGrid...');
      console.log('📧 Recipients:', [booking.customerEmail, BOOKING_DEPT_EMAIL]);
      console.log('📋 Template data:', JSON.stringify(templateData, null, 2));
      const [response] = await sgMail.send(msg);
      
      console.log('✅ Email sent successfully via SendGrid to both customer and booking department!');
      console.log('✅ Status Code:', response.statusCode);
      console.log('✅ Message ID:', response.headers['x-message-id']);

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
      };
    }
    
    // Fallback to Nodemailer if SendGrid is not configured
    console.log('⚠️ SendGrid not configured, using Nodemailer fallback');
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"${SENDGRID_FROM_NAME}" <${SENDGRID_FROM_EMAIL}>`,
      to: [booking.customerEmail, BOOKING_DEPT_EMAIL], // Send to both customer and booking department
      subject: `Booking Confirmation - ${booking.tourTitle} (${booking.bookingId})`,
      html: generateBookingConfirmationEmail(booking),
      text: `
Booking Confirmation - ${booking.tourTitle}

Dear ${booking.customerName},

Your booking has been confirmed! Here are the details:

Booking ID: ${booking.bookingId}
Tour: ${booking.tourTitle}
Date: ${new Date(booking.tourDate).toLocaleDateString()}
Passengers: ${booking.passengers}
Total Amount: PHP ${booking.totalAmount.toLocaleString()}

We'll be in touch with more details soon.

Thank you for choosing Discover Group!

The Discover Group Team
Email: reservations@discovergroup.com
Phone: +63 02 8555 1234
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    if (previewUrl) {
      console.log('📧 Email Preview URL: %s', previewUrl);
    }

    console.log('✅ Email sent successfully! Message ID:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};