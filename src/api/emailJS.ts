import emailjs from '@emailjs/browser';

// EmailJS configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_uac8ja9';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_zyols7w';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'HDcNoEEoPzbJe9Yd-';

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
}

// Initialize EmailJS (call this once in your app)
export const initEmailJS = () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);
};

// Send booking confirmation email using EmailJS
export const sendBookingConfirmationEmailJS = async (data: BookingEmailData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    // Initialize EmailJS if not already done
    initEmailJS();

    // Prepare template parameters to match your EmailJS template exactly
    const templateParams = {
      to_email: data.customerEmail,
      email: data.customerEmail,  // Your template also has an 'email' field
      to_name: data.customerName,
      booking_id: data.bookingId,
      tour_title: data.tourTitle,
      company_name: 'Discover Group'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return {
      success: true,
      message: 'Email sent successfully via EmailJS'
    };
  } catch (error: unknown) {
    // More detailed error logging
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      // Log error details only in development
      if (import.meta.env.DEV) {
        console.error('❌ EmailJS error details:', {
          name: errorObj.name,
          text: errorObj.text,
          status: errorObj.status,
          message: errorObj.message
        });
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Test function to verify EmailJS configuration
export const testEmailJS = async (testEmail: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    // Initialize EmailJS
    initEmailJS();

    // Use minimal test data that matches your template exactly
    const testData = {
      to_email: testEmail,
      email: testEmail,  // Your template also has an 'email' field
      to_name: 'Test User',
      booking_id: 'TEST-123',
      tour_title: 'Test Tour - Sample Booking',
      company_name: 'Discover Group'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testData
    );

    return {
      success: true,
      message: 'Test email sent successfully'
    };
  } catch (error: unknown) {
    // More detailed error logging for EmailJS
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('❌ Test email error details:', {
          name: errorObj.name,
          text: errorObj.text,
          status: errorObj.status,
          message: errorObj.message,
          fullError: error
        });
      }
    }
    
    // Try to extract meaningful error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      if (errorObj.text) {
        errorMessage = String(errorObj.text);
      } else if (errorObj.message) {
        errorMessage = String(errorObj.message);
      } else if (errorObj.status) {
        errorMessage = `EmailJS error ${errorObj.status}`;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Simple EmailJS test with minimal data
export const testEmailJSSimple = async (testEmail: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    // Use absolute minimal data - try both email field names
    const testData = {
      to_email: testEmail,
      email: testEmail,  // Your template also has an 'email' field
      to_name: 'Test User'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testData
    );

    return {
      success: true,
      message: 'Simple test email sent successfully'
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('❌ Simple test email failed:', error);
        console.error('❌ Simple test error details:', errorObj);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Fallback function that tries both methods
export const sendBookingConfirmationEmailFallback = async (data: BookingEmailData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  // Try EmailJS first (more reliable for client-side)
  const emailJSResult = await sendBookingConfirmationEmailJS(data);
  
  if (emailJSResult.success) {
    return emailJSResult;
  }

  // If EmailJS fails, try the server-side API
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const response = await fetch(`${API_BASE_URL}/api/send-booking-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        message: 'Email sent successfully via server API'
      };
    } else {
      throw new Error(result.error || 'Server API failed');
    }
  } catch (serverError) {
    if (import.meta.env.DEV) {
      console.error('❌ Both EmailJS and server API failed');
    }
    return {
      success: false,
      error: `EmailJS: ${emailJSResult.error}, Server: ${serverError instanceof Error ? serverError.message : 'Unknown error'}`
    };
  }
};