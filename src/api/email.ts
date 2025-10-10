// Email API functions

const API_BASE = "http://localhost:4000";

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

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<{
  success: boolean;
  message?: string;
  previewUrl?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/send-booking-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    return result;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}