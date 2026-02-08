
import React, { useState, useEffect } from 'react';
import { SectionHeading } from './SectionHeading';
import { PRICING_TIERS_INR, PRICING_TIERS_USD } from '../constants';
import { PricingTier } from '../types';
import { Button } from './Button';
import { Check, ShieldCheck, Zap, Star, Globe } from 'lucide-react';
import { Reveal } from './Reveal';
import { initiateRazorpayPayment } from '../utils/razorpay';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal, SignupModal } from './LoginModal';
import { db } from '../config/firebase';
import { doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

interface PricingProps {
  onShowLogin?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onShowLogin }) => {
  const { isAuthenticated, user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<PricingTier | null>(null);
  const [isIndia, setIsIndia] = useState<boolean>(true);
  const [showCurrencyToggle, setShowCurrencyToggle] = useState<boolean>(false);

  const getCurrentPeriodEnd = (tier: PricingTier): Date => {
    const now = new Date();
    const frequency = (tier.frequency || '').toLowerCase();
    const name = (tier.name || '').toLowerCase();
    const end = new Date(now);
    if (frequency.includes('month') || frequency === '/month') {
      end.setMonth(end.getMonth() + 1);
      return end;
    }
    if (name.includes('6 month') || frequency.includes('6')) {
      end.setMonth(end.getMonth() + 6);
      return end;
    }
    end.setMonth(end.getMonth() + 6);
    return end;
  };

  const saveSubscription = async (tier: PricingTier, paymentResponse: any) => {
    if (!user?.id) return;
    const currentPeriodEnd = getCurrentPeriodEnd(tier);
    const subscriptionRef = doc(db, 'subscription', user.id);
    await setDoc(subscriptionRef, {
      id: user.id,
      planType: tier.name,
      status: 'active',
      currentPeriodEnd: Timestamp.fromDate(currentPeriodEnd),
      paymentId: paymentResponse?.razorpay_payment_id ?? null,
      planFrequency: tier.frequency ?? null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });

    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      plan: tier.name,
      planStatus: 'active',
      planCurrentPeriodEnd: Timestamp.fromDate(currentPeriodEnd),
      planUpdatedAt: serverTimestamp(),
    }, { merge: true });
  };

  const handlePaymentSuccess = (tier: PricingTier, response: any) => {
    console.log('Payment successful:', response);
    saveSubscription(tier, response).catch((error) => {
      console.error('Error saving subscription:', error);
    });
    alert(`Payment successful! Welcome to ${tier.name}. Your payment ID: ${response.razorpay_payment_id}`);
  };

  // Detect user location on component mount
  useEffect(() => {
    // Check timezone first (quick check)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isIndiaTimezone = timezone.includes('Calcutta') || timezone.includes('Kolkata') || timezone.includes('Asia/Kolkata');
    
    // Check browser language
    const language = navigator.language || (navigator as any).userLanguage;
    const isIndiaLanguage = language.includes('en-IN') || language.includes('hi');
    
    // Try to get more accurate location via IP (fallback to timezone/language)
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code === 'IN') {
          setIsIndia(true);
        } else if (data.country_code) {
          setIsIndia(false);
        } else {
          // Fallback to timezone/language detection
          setIsIndia(isIndiaTimezone || isIndiaLanguage);
        }
        setShowCurrencyToggle(true);
      })
      .catch(() => {
        // Fallback to timezone/language detection if IP API fails
        setIsIndia(isIndiaTimezone || isIndiaLanguage);
        setShowCurrencyToggle(true);
      });
  }, []);

  const currentPricingTiers = isIndia ? PRICING_TIERS_INR : PRICING_TIERS_USD;

  // Proceed with purchase after successful login/signup
  useEffect(() => {
    if (isAuthenticated && pendingPurchase) {
      const tier = pendingPurchase;
      const isUSD = tier.price.includes('$');
      
      // Extract numeric value from price string
      const priceMatch = tier.price.replace(/[₹$,]/g, '').match(/\d+/);
      const amount = priceMatch ? parseFloat(priceMatch[0]) : 0;

      if (amount > 0) {
        // Small delay to ensure modal is closed
        setTimeout(() => {
          if (isUSD) {
            // For USD payments, show a message (Razorpay is INR only)
            // In production, you'd integrate with Stripe or another international payment gateway
            alert('International payments coming soon! For now, please contact support at support@yogaflow.com to complete your purchase.');
            setPendingPurchase(null);
          } else {
            // INR payments via Razorpay
            initiateRazorpayPayment(
              amount,
              tier.name,
              tier.frequency,
              (response) => {
                handlePaymentSuccess(tier, response);
                setPendingPurchase(null);
                // Here you would typically redirect to a success page or update user status
              },
              (error) => {
                // Payment failed or cancelled
                console.error('Payment error:', error);
                setPendingPurchase(null);
                if (error.message !== 'Payment cancelled by user') {
                  alert('Payment failed. Please try again or contact support.');
                }
              }
            );
          }
        }, 300);
      }
    }
  }, [isAuthenticated, pendingPurchase]);

  const handlePurchase = (tier: PricingTier) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      // Store the purchase intent and show login modal
      setPendingPurchase(tier);
      setIsLoginModalOpen(true);
      return;
    }

    // User is logged in, proceed with payment
    const isUSD = tier.price.includes('$');
    
    // Extract numeric value from price string
    const priceMatch = tier.price.replace(/[₹$,]/g, '').match(/\d+/);
    const amount = priceMatch ? parseFloat(priceMatch[0]) : 0;

    if (amount === 0) {
      alert('Invalid pricing information. Please contact support.');
      return;
    }

    if (isUSD) {
      // For USD payments, show a message (Razorpay is INR only)
      // In production, you'd integrate with Stripe or another international payment gateway
      alert('International payments coming soon! For now, please contact support at support@yogaflow.com to complete your purchase.');
      return;
    }

    // INR payments via Razorpay
    initiateRazorpayPayment(
      amount,
      tier.name,
      tier.frequency,
      (response) => {
        handlePaymentSuccess(tier, response);
        // Here you would typically redirect to a success page or update user status
      },
      (error) => {
        // Payment failed or cancelled
        console.error('Payment error:', error);
        if (error.message !== 'Payment cancelled by user') {
          alert('Payment failed. Please try again or contact support.');
        }
      }
    );
  };

  return (
    <section className="bg-white py-32 md:py-48 px-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-50 rounded-full blur-[120px] opacity-40"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Reveal>
          <SectionHeading 
            title="Invest In Your Well-being" 
            subtitle="Transparent pricing. No hidden fees. Rooted in real transformation."
          />
        </Reveal>

        {/* Currency Toggle */}
        {showCurrencyToggle && (
          <Reveal delay={0.2}>
            <div className="flex items-center justify-center gap-4 mt-8 mb-4">
              <button
                onClick={() => setIsIndia(true)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  isIndia
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ₹ INDIAN
              </button>
              <button
                onClick={() => setIsIndia(false)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  !isIndia
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                $ GLOBAL
              </button>
              <Globe className="text-slate-400" size={18} />
            </div>
          </Reveal>
        )}

        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start mt-16 max-w-5xl mx-auto">
          {currentPricingTiers.map((tier, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <div 
                className={`relative rounded-[3rem] p-10 md:p-14 transition-all duration-700 h-full flex flex-col ${
                  tier.isRecommended 
                  ? 'bg-slate-900 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] scale-105 z-10' 
                  : 'bg-white border border-slate-100 shadow-sm hover:shadow-xl'
                }`}
              >
                {tier.isRecommended && (
                  <div className="absolute top-8 right-8">
                    <span className="bg-teal-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="mb-10">
                  {tier.isRecommended ? (
                    <Zap className="text-teal-400 mb-6" size={32} />
                  ) : (
                    <ShieldCheck className="text-teal-600 mb-6" size={32} />
                  )}
                  <h3 className={`text-2xl md:text-3xl font-serif font-bold mb-3 ${tier.isRecommended ? 'text-white' : 'text-slate-900'}`}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-serif font-bold">{tier.price}</span>
                    <span className={`${tier.isRecommended ? 'text-teal-200/60' : 'text-slate-400'} text-sm font-medium tracking-widest uppercase`}>
                      {tier.frequency}
                    </span>
                  </div>
                </div>

                <div className={`h-px w-full mb-10 ${tier.isRecommended ? 'bg-white/10' : 'bg-slate-100'}`}></div>

                <ul className="space-y-6 mb-12 flex-grow">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-4">
                      <div className={`p-1 rounded-full shrink-0 mt-0.5 ${tier.isRecommended ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <span className={`text-base font-light leading-relaxed ${tier.isRecommended ? 'text-teal-50' : 'text-slate-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={tier.isRecommended ? 'primary' : 'outline'} 
                  className={`w-full py-6 rounded-full text-sm tracking-widest uppercase font-bold transition-all duration-500 ${
                    tier.isRecommended 
                    ? 'bg-teal-500 hover:bg-teal-400 border-none shadow-[0_20px_40px_-10px_rgba(20,184,166,0.3)] hover:scale-[1.02]' 
                    : 'hover:bg-teal-600 hover:text-white'
                  }`}
                  onClick={() => handlePurchase(tier)}
                >
                  {tier.buttonText}
                </Button>

                {tier.isRecommended && (
                  <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-teal-300 font-bold opacity-80">
                    <Star size={14} /> Best Value • Save 25%
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
        
        <Reveal delay={0.4}>
          <div className="mt-24 text-center">
              <div className="inline-block px-8 py-6 bg-teal-50/50 rounded-3xl border border-teal-100 max-w-2xl">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Need extra guidance? 1-on-1 private sessions available for members at <span className="font-bold text-slate-900 border-b-2 border-teal-200 pb-0.5">$19/hr</span>.
                </p>
                <div className="mt-4 flex items-center justify-center gap-6">
                   <div className="text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} /> Secure Payment
                   </div>
                   <div className="text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} /> Instant Access
                   </div>
                </div>
              </div>
          </div>
        </Reveal>
      </div>

      {/* Login/Signup Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          // Clear pending purchase if user closes modal without logging in
          if (!isAuthenticated) {
            setPendingPurchase(null);
          }
        }}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => {
          setIsSignupModalOpen(false);
          // Clear pending purchase if user closes modal without signing up
          if (!isAuthenticated) {
            setPendingPurchase(null);
          }
        }}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </section>
  );
};
