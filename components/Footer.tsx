import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Compass,
  Clock,
  ArrowRight
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
          <div className="w-full pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
               <a href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><Instagram size={20} /></a>
               <a href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><Twitter size={20} /></a>
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