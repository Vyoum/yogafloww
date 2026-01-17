import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Facebook, 
  Compass,
  Clock,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { LOGO_URL } from '../constants';

interface FooterProps {
  onNavHome: () => void;
  onNavInstructors: () => void;
  onNavClasses: () => void;
  onNavAbout: () => void;
  onNavPricing: () => void;
  onNavCommunity: () => void;
  isHomePage: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavHome, onNavInstructors, onNavClasses, onNavAbout, onNavPricing, onNavCommunity, isHomePage }) => {
  const [indiaTime, setIndiaTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      setIndiaTime(formatter.format(new Date()));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { name: 'The Journey', href: '#journey', action: isHomePage ? null : onNavHome },
    { name: 'Classes', href: '#classes', action: onNavClasses },
    { name: 'Instructors', href: '#instructors', action: onNavInstructors },
    { name: 'Community', href: '#community', action: onNavCommunity },
    { name: 'About', href: '#about', action: onNavAbout },
    { name: 'Pricing', href: '#pricing', action: onNavPricing }
  ];

  return (
    <footer className="relative bg-white border-t border-slate-100 pt-24 pb-12 overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-50 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none opacity-40"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <button 
            onClick={onNavHome}
            className="flex flex-col items-center gap-4 group mb-8"
          >
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl group-hover:rotate-12 transition-transform">
              <img src={LOGO_URL} alt="Yoga Flow" className="w-full h-full object-cover" />
            </div>
            <span className="text-3xl md:text-5xl font-serif font-bold tracking-tighter text-slate-900 group-hover:text-teal-600 transition-colors">
              Yoga Flow
            </span>
          </button>
          
          <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed mb-12">
            A live, 6-month yoga transformation program rooted in the lineage of Rishikesh, designed for modern lives.
          </p>
          <nav className="flex flex-wrap justify-center gap-8 md:gap-12 mb-16">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => {
                  if (link.action) {
                    e.preventDefault();
                    link.action();
                  }
                }}
                className="text-[11px] uppercase tracking-[0.3em] font-bold text-slate-900 hover:text-teal-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="w-full max-w-2xl bg-teal-50 border border-teal-100 rounded-[2.5rem] p-8 md:p-12 mb-20">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-teal-600 mb-4">The Practice Insider</h3>
            <p className="text-slate-900 text-xl md:text-2xl font-serif mb-8">Insights on breath, sleep, and longevity.</p>
            <div className="relative max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="email@address.com" 
                className="w-full bg-white border border-teal-100 rounded-full py-4 px-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-teal-600 text-white px-6 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-lg">
                Join <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Download App Section */}
          <div className="w-full max-w-2xl mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Smartphone className="text-teal-600" size={20} />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900">Download Our App</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* App Store Button */}
              <a 
                href="#" 
                className="group flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                aria-label="Download on the App Store"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] leading-tight opacity-90">Download on the</span>
                  <span className="text-base font-semibold leading-tight">App Store</span>
                </div>
              </a>

              {/* Google Play Store Button */}
              <a 
                href="#" 
                className="group flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                aria-label="Get it on Google Play"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.19,15.12L14.54,12.47L17.19,9.88L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] leading-tight opacity-90">GET IT ON</span>
                  <span className="text-base font-semibold leading-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          <div className="w-full pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
               <a href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><Instagram size={20} /></a>
               <a href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><Facebook size={20} /></a>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <Compass size={14} className="text-teal-500" />
                Rishikesh, India
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 tabular-nums">
                <Clock size={14} className="text-teal-500" />
                {indiaTime || 'Loading Time...'}
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              © {new Date().getFullYear()} Yoga Flow Inc.
            </p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10vw] font-serif font-bold text-slate-50 select-none pointer-events-none whitespace-nowrap uppercase tracking-widest">
        Authentic Tradition
      </div>
    </footer>
  );
};