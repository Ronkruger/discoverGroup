import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

import { getBookingDepartmentEmail, getEmailFromAddress, getEmailFromName } from '../routes/admin/settings';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully in API');
} else {
  console.warn('⚠️ SendGrid API key not found - email sending will use fallback');
}

interface CustomRoute {
  tourSlug: string;
  tourTitle: string;
  tourLine?: string;
  durationDays: number;
  pricePerPerson: number;
  insertAfterDay: number;
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
  paymentMethod?: string;
  paymentMethodDescription?: string;
  paymentMethodIcon?: string;
  paymentGateway?: string;
  customRoutes?: CustomRoute[];
  // Visa assistance fields
  visaAssistanceRequested?: boolean;
  visaDocumentsProvided?: boolean;
  visaDestinationCountries?: string;
  visaAssistanceStatus?: string;
  visaAssistanceNotes?: string;
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
    
    console.log('🔧 Environment check:');
    console.log('- SENDGRID_API_KEY:', SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('- SENDGRID_TEMPLATE_ID:', SENDGRID_TEMPLATE_ID ? '✅ Set' : '❌ Not set');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
    console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
    
    // Try SendGrid first
    if (SENDGRID_API_KEY && SENDGRID_TEMPLATE_ID) {
      try {
        console.log('📧 Using SendGrid for email delivery');
      
      // Format tour date - handle both single dates and date ranges
      let formattedTourDate: string;
      if (!booking.tourDate || booking.tourDate === '') {
        formattedTourDate = 'Date to be confirmed';
      } else if (booking.tourDate.includes(' - ')) {
        // Handle date range (e.g., "2025-05-13 - 2025-05-27")
        const [startDate, endDate] = booking.tourDate.split(' - ').map(d => d.trim());
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          formattedTourDate = booking.tourDate; // Use original if invalid
        } else {
          formattedTourDate = `${start.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })} - ${end.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}`;
        }
      } else {
        // Handle single date
        const date = new Date(booking.tourDate);
        if (isNaN(date.getTime())) {
          formattedTourDate = booking.tourDate; // Use original if invalid
        } else {
          formattedTourDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }

      // Calculate combined tour details
      const hasCustomRoutes = booking.customRoutes && booking.customRoutes.length > 0;
      const baseDurationDays = parseInt(booking.tourTitle.match(/\d+/)?.[0] || '0');
      const additionalDays = hasCustomRoutes 
        ? booking.customRoutes.reduce((sum, route) => sum + route.durationDays, 0)
        : 0;
      const totalDays = baseDurationDays + additionalDays;
      
      // Calculate combined price per person
      const combinedPricePerPerson = hasCustomRoutes
        ? booking.pricePerPerson + booking.customRoutes.reduce((sum, route) => sum + route.pricePerPerson, 0)
        : booking.pricePerPerson;

      // Prepare template data
      const templateData = {
        customerName: booking.customerName,
        bookingId: booking.bookingId,
        tourTitle: booking.tourTitle,
        tourDate: formattedTourDate,
        passengers: booking.passengers.toString(),
        pricePerPerson: formatCurrency(booking.pricePerPerson),
        totalAmount: formatCurrency(booking.totalAmount),
        isDownpaymentOnly: booking.isDownpaymentOnly || false,
        bookingDetailsUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-confirmation/${booking.bookingId}`,
        // Combined tour details
        hasCustomRoutes,
        ...(hasCustomRoutes && {
          customRoutes: booking.customRoutes?.map(route => ({
            tourTitle: route.tourTitle,
            tourLine: route.tourLine || '',
            durationDays: route.durationDays,
            pricePerPerson: formatCurrency(route.pricePerPerson),
          })),
          combinedDurationDays: totalDays,
          combinedPricePerPerson: formatCurrency(combinedPricePerPerson),
        }),
        // Payment method details
        ...(booking.paymentMethod && {
          paymentMethod: booking.paymentMethod,
          paymentMethodIcon: booking.paymentMethodIcon || '💳',
          paymentMethodDescription: booking.paymentMethodDescription || '',
          paymentGateway: booking.paymentGateway || 'Online Payment',
        }),
        // Downpayment details
        ...(booking.downpaymentAmount && {
          downpaymentAmount: formatCurrency(booking.downpaymentAmount),
          remainingBalance: formatCurrency(booking.remainingBalance || 0),
        }),
        // Appointment details
        ...(booking.appointmentDate && booking.appointmentTime && {
          appointmentDate: (() => {
            const date = new Date(booking.appointmentDate);
            if (isNaN(date.getTime())) {
              return booking.appointmentDate; // Use original if invalid
            }
            return date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          })(),
          appointmentTime: booking.appointmentTime,
          appointmentPurpose: formatAppointmentPurpose(booking.appointmentPurpose),
        }),
        // Visa assistance data
        visaAssistanceRequested: booking.visaAssistanceRequested || false,
        visaDocumentsProvided: booking.visaDocumentsProvided || false,
        visaDestinationCountries: booking.visaDestinationCountries || '',
        visaAssistanceStatus: booking.visaAssistanceStatus || 'not-needed',
        tourDestinationCountries: booking.country || booking.tourTitle || 'your destination',
      };

      // Get current settings
      const bookingDeptEmail = getBookingDepartmentEmail();
      const fromEmail = getEmailFromAddress();
      const fromName = getEmailFromName();

      // Send email to both customer and booking department
      const msg = {
        to: [
          booking.customerEmail, // Customer email
          bookingDeptEmail     // Booking department email (configurable)
        ],
        from: {
          email: fromEmail,
          name: fromName,
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
      console.log('📧 Recipients:', [booking.customerEmail, bookingDeptEmail]);
      console.log('📋 Template data:', JSON.stringify(templateData, null, 2));
      const [response] = await sgMail.send(msg);
      
      console.log('✅ Email sent successfully via SendGrid to both customer and booking department!');
      console.log('✅ Status Code:', response.statusCode);
      console.log('✅ Message ID:', response.headers['x-message-id']);

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
      };
      } catch (sendGridError) {
        console.error('❌ SendGrid error:', sendGridError);
        console.error('SendGrid error details:', JSON.stringify(sendGridError, null, 2));
        // Don't return error yet, try Nodemailer fallback
      }
    }
    
    // Fallback to Nodemailer if SendGrid is not configured or fails
    console.log('⚠️ SendGrid not configured or failed, using Nodemailer fallback');
    
    try {
      const transporter = await createTransporter();
      
      // Get current settings
      const bookingDeptEmail = getBookingDepartmentEmail();
      const fromEmail = getEmailFromAddress();
      const fromName = getEmailFromName();
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: [booking.customerEmail, bookingDeptEmail], // Send to both customer and booking department
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
    } catch (nodemailerError) {
      console.error('❌ Nodemailer also failed:', nodemailerError);
      return {
        success: false,
        error: nodemailerError instanceof Error ? nodemailerError.message : 'Failed to send email via Nodemailer',
      };
    }
  } catch (error) {
    console.error('❌ Email sending failed with critical error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  verificationToken: string
): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> => {
  try {
    console.log('📧 Sending verification email to:', email);
    console.log('🔧 Environment check for verification email:');
    console.log('- SENDGRID_API_KEY:', SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
    
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    // Try SendGrid first
    if (SENDGRID_API_KEY) {
      try {
        console.log('📧 Using SendGrid for verification email');
      
      const fromEmail = getEmailFromAddress();
      const fromName = getEmailFromName();
      
      const msg = {
        to: email,
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: 'Verify Your Email - Discover Group',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
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
        .verify-btn { 
            display: inline-block; 
            background: #3b82f6; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            margin: 20px 0; 
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
        <h1>✉️ Verify Your Email</h1>
    </div>
    
    <div class="content">
        <p>Hello ${fullName},</p>
        
        <p>Thank you for registering with Discover Group! To complete your registration and start booking amazing tours, please verify your email address.</p>
        
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="verify-btn">Verify Email Address</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
        
        <p><strong>This link will expire in 24 hours.</strong></p>
        
        <p>If you didn't create an account with Discover Group, please ignore this email.</p>
        
        <p>Best regards,<br>
        <strong>The Discover Group Team</strong></p>
    </div>
    
    <div class="footer">
        <p>© 2025 Discover Group. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
        `,
        text: `
Hello ${fullName},

Thank you for registering with Discover Group!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with Discover Group, please ignore this email.

Best regards,
The Discover Group Team
        `.trim(),
      };

      const [response] = await sgMail.send(msg);
      
      console.log('✅ Verification email sent via SendGrid!');
      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
      };
      } catch (sendGridError) {
        console.error('❌ SendGrid verification email error:', sendGridError);
        // Don't return error yet, try Nodemailer fallback
      }
    }
    
    // Fallback to Nodemailer
    console.log('⚠️ SendGrid not configured or failed, using Nodemailer fallback for verification email');
    
    try {
      const transporter = await createTransporter();
    
    const fromEmail = getEmailFromAddress();
    const fromName = getEmailFromName();
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Verify Your Email - Discover Group',
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; }
        .verify-btn { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✉️ Verify Your Email</h1>
        </div>
        <div class="content">
            <p>Hello ${fullName},</p>
            <p>Thank you for registering with Discover Group! Please verify your email address:</p>
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="verify-btn">Verify Email Address</a>
            </div>
            <p>This link will expire in 24 hours.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
Hello ${fullName},

Please verify your email address by clicking this link:
${verificationUrl}

This link will expire in 24 hours.

Best regards,
The Discover Group Team
      `.trim(),
    };

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      
      if (previewUrl) {
        console.log('📧 Verification Email Preview URL: %s', previewUrl);
      }

      console.log('✅ Verification email sent! Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (nodemailerError) {
      console.error('❌ Nodemailer verification email also failed:', nodemailerError);
      return {
        success: false,
        error: nodemailerError instanceof Error ? nodemailerError.message : 'Failed to send verification email via Nodemailer',
      };
    }
  } catch (error) {
    console.error('❌ Verification email sending failed with critical error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetUrl: string
): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> => {
  try {
    console.log('📧 Sending password reset email to:', email);
    console.log('🔧 Environment check for password reset email:');
    console.log('- SENDGRID_API_KEY:', SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
    
    const passwordResetHtml = `
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .container { 
            background: #f5f5f5; 
            border-radius: 8px; 
            padding: 30px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 20px; 
            border-radius: 8px 8px 0 0; 
            text-align: center; 
        }
        .content { 
            background: white; 
            padding: 20px; 
            border-radius: 0 0 8px 8px; 
        }
        .reset-btn { 
            display: inline-block; 
            padding: 12px 30px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: bold; 
        }
        .reset-btn:hover { 
            opacity: 0.9; 
        }
        .footer { 
            margin-top: 20px; 
            font-size: 12px; 
            color: #666; 
            border-top: 1px solid #eee; 
            padding-top: 10px; 
        }
    </style>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
            <p>Hello ${fullName},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-btn">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy this link: <br><code>${resetUrl}</code></p>
            <p style="color: #d32f2f;">This link will expire in 1 hour.</p>
            <p style="color: #666;">If you didn't request a password reset, you can ignore this email.</p>
        </div>
        <div class="footer">
            <p>© Discover Group. All rights reserved.</p>
        </div>
    </div>
    `;

    const passwordResetText = `
Hello ${fullName},

We received a request to reset your password. Click the link below to set a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can ignore this email.

Best regards,
The Discover Group Team
    `.trim();

    // Try SendGrid first
    if (SENDGRID_API_KEY) {
      try {
        console.log('📧 Using SendGrid for password reset email');
      
        const fromEmail = getEmailFromAddress();
        const fromName = getEmailFromName();
        
        const msg = {
          to: email,
          from: {
            email: fromEmail,
            name: fromName,
          },
          subject: 'Password Reset Request - Discover Group',
          html: passwordResetHtml,
          text: passwordResetText,
          categories: ['password-reset', 'transactional'],
          customArgs: {
            email: email,
            type: 'password-reset',
          },
        };

        console.log('📤 Sending password reset email via SendGrid...');
        const [response] = await sgMail.send(msg);
        
        console.log('✅ Password reset email sent successfully via SendGrid!');
        console.log('✅ Status Code:', response.statusCode);
        console.log('✅ Message ID:', response.headers['x-message-id']);

        return {
          success: true,
          messageId: response.headers['x-message-id'] as string,
        };
      } catch (sendGridError) {
        console.error('❌ SendGrid password reset error:', sendGridError);
        console.error('SendGrid error details:', JSON.stringify(sendGridError, null, 2));
        // Don't return error yet, try Nodemailer fallback
      }
    }

    // Fallback to Nodemailer if SendGrid is not configured or fails
    console.log('⚠️ SendGrid not configured or failed, using Nodemailer fallback for password reset');
    
    try {
      const transporter = await createTransporter();
      const fromEmail = getEmailFromAddress();
      const fromName = getEmailFromName();

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Password Reset Request - Discover Group',
        html: passwordResetHtml,
        text: passwordResetText,
      };

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);

      if (previewUrl) {
        console.log('📧 Password Reset Email Preview URL: %s', previewUrl);
      }

      console.log('✅ Password reset email sent via Nodemailer! Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (nodemailerError) {
      console.error('❌ Nodemailer also failed:', nodemailerError);
      return {
        success: false,
        error: nodemailerError instanceof Error ? nodemailerError.message : 'Failed to send password reset email via Nodemailer',
      };
    }
  } catch (error) {
    console.error('❌ Password reset email sending failed with critical error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};