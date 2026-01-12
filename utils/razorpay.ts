// Razorpay Payment Integration
const RAZORPAY_KEY_ID = 'rzp_live_RUVJ48Tx6iUsSt';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  name: string;
  description: string;
  handler: (response: any) => void;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

export const initiateRazorpayPayment = (
  amount: number,
  planName: string,
  planFrequency: string,
  onSuccess?: (response: any) => void,
  onError?: (error: any) => void
) => {
  // Load Razorpay script if not already loaded
  if (!window.Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      openRazorpayCheckout(amount, planName, planFrequency, onSuccess, onError);
    };
    script.onerror = () => {
      if (onError) {
        onError(new Error('Failed to load Razorpay checkout script'));
      }
    };
    document.body.appendChild(script);
  } else {
    openRazorpayCheckout(amount, planName, planFrequency, onSuccess, onError);
  }
};

const openRazorpayCheckout = (
  amount: number,
  planName: string,
  planFrequency: string,
  onSuccess?: (response: any) => void,
  onError?: (error: any) => void
) => {
  // Convert amount to paise (INR smallest unit)
  // Assuming amount is in USD, converting to INR (1 USD = 83 INR approximately)
  // You may want to adjust this conversion rate
  const amountInINR = amount * 83;
  const amountInPaise = Math.round(amountInINR * 100);

  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID,
    amount: amountInPaise,
    currency: 'INR',
    name: 'Yoga Flow',
    description: `${planName} - ${planFrequency}`,
    handler: function (response: any) {
      // Payment successful
      console.log('Payment successful:', response);
      if (onSuccess) {
        onSuccess(response);
      }
      // Here you would typically send the payment details to your backend
      // to verify the payment signature
    },
    prefill: {
      // You can prefill user details if available
    },
    theme: {
      color: '#0d9488', // Teal color matching your brand
    },
    modal: {
      ondismiss: function () {
        // User closed the payment modal
        if (onError) {
          onError(new Error('Payment cancelled by user'));
        }
      },
    },
  };

  try {
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Error opening Razorpay checkout:', error);
    if (onError) {
      onError(error);
    }
  }
};
