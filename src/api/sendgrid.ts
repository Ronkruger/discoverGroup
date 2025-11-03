import sgMail from '@sendgrid/mail';

// SendGrid configuration from environment variables
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;
const SENDGRID_TEMPLATE_ID = import.meta.env.VITE_SENDGRID_TEMPLATE_ID;
const SENDGRID_FROM_EMAIL = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'bookings@discovergroup.com';
const SENDGRID_FROM_NAME = import.meta.env.VITE_SENDGRID_FROM_NAME || 'Discover Group';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
} else {
  console.warn('⚠️ SendGrid API key not found in environment variables');
}

interface BookingEmailData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  tourTitle: string;
  tourDate: string;
  passengers: number;
  pricePerPerson: number;
  totalAmount: number;
  downpaymentAmount?: number;
  remainingBalance?: number;
  isDownpaymentOnly?: boolean;
  country?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentPurpose?: string;
}

/**
 * Format currency for display in emails
 */
function formatCurrency(amount: number): string {
  return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format appointment purpose for display
 */
function formatAppointmentPurpose(purpose: string): string {
  return purpose
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Send booking confirmation email using SendGrid Dynamic Templates
 */
export async function sendBookingConfirmationEmail(
  data: BookingEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Validate required configuration
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured. Please set VITE_SENDGRID_API_KEY in your .env file');
    }

    if (!SENDGRID_TEMPLATE_ID) {
      throw new Error('SendGrid template ID is not configured. Please set VITE_SENDGRID_TEMPLATE_ID in your .env file');
    }

    console.log('📧 Preparing to send booking confirmation email via SendGrid');
    console.log('📧 Recipient:', data.customerEmail);
    console.log('📧 Template ID:', SENDGRID_TEMPLATE_ID);

    // Prepare template data (matching your SendGrid template variables)
    const templateData = {
      customerName: data.customerName,
      bookingId: data.bookingId,
      tourTitle: data.tourTitle,
      tourDate: new Date(data.tourDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      passengers: data.passengers.toString(),
      pricePerPerson: formatCurrency(data.pricePerPerson),
      totalAmount: formatCurrency(data.totalAmount),
      // Optional fields
      ...(data.downpaymentAmount && {
        downpaymentAmount: formatCurrency(data.downpaymentAmount),
        remainingBalance: formatCurrency(data.remainingBalance || 0),
      }),
      ...(data.appointmentDate && {
        appointmentDate: new Date(data.appointmentDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointmentTime: data.appointmentTime,
        appointmentPurpose: formatAppointmentPurpose(data.appointmentPurpose || 'consultation'),
      }),
    };

    console.log('📧 Template data prepared:', templateData);

    // Prepare email message
    const msg = {
      to: data.customerEmail,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: SENDGRID_FROM_NAME,
      },
      templateId: SENDGRID_TEMPLATE_ID,
      dynamicTemplateData: templateData,
      // Optional: Add categories for tracking
      categories: ['booking-confirmation', 'transactional'],
      // Optional: Custom args for tracking
      customArgs: {
        bookingId: data.bookingId,
        tourTitle: data.tourTitle,
      },
    };

    // Send email
    console.log('📧 Sending email via SendGrid...');
    const [response] = await sgMail.send(msg);

    console.log('✅ Email sent successfully via SendGrid');
    console.log('✅ Status Code:', response.statusCode);
    console.log('✅ Message ID:', response.headers['x-message-id']);

    return {
      success: true,
      messageId: response.headers['x-message-id'] as string,
    };
  } catch (error: unknown) {
    console.error('❌ SendGrid email sending failed:', error);

    // Extract meaningful error message
    let errorMessage = 'Unknown error';
    
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as { response?: { body?: { errors?: Array<{ message?: string }> } }; message?: string };
      console.error('❌ SendGrid error response:', sgError.response?.body);
      errorMessage = sgError.response?.body?.errors?.[0]?.message || sgError.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Test SendGrid configuration and send a test email
 */
export async function testSendGrid(testEmail: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  console.log('🧪 Testing SendGrid configuration...');

  const testData: BookingEmailData = {
    bookingId: 'TEST-' + Date.now(),
    customerName: 'Test User',
    customerEmail: testEmail,
    tourTitle: 'Route A Preferred - Europe Tour (TEST)',
    tourDate: new Date().toISOString(),
    passengers: 2,
    pricePerPerson: 125000,
    totalAmount: 250000,
    appointmentDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    appointmentTime: '14:00',
    appointmentPurpose: 'consultation',
  };

  return await sendBookingConfirmationEmail(testData);
}

/**
 * Send email with retry logic (for better reliability)
 */
export async function sendBookingConfirmationEmailWithRetry(
  data: BookingEmailData,
  maxRetries: number = 3
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📧 Email sending attempt ${attempt}/${maxRetries}`);
    
    const result = await sendBookingConfirmationEmail(data);
    
    if (result.success) {
      return result;
    }
    
    if (attempt < maxRetries) {
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts`,
  };
}
