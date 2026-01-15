
import React, { useState } from 'react';
import { Reveal } from './Reveal';
import { Button } from './Button';
import { Mail, MessageSquare, MapPin, Send, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import { saveContactMessage } from '../utils/contactForm';

export const Contact: React.FC = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    try {
      await saveContactMessage({
        name: formData.name,
        email: formData.email,
        inquiryType: formData.inquiryType,
        message: formData.message
      });
      
      setFormState('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        inquiryType: 'General Inquiry',
        message: ''
      });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      setFormState('error');
      setErrorMessage(error.message || 'Failed to send message. Please try again or contact us directly.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (formState === 'success') {
    return (
      <section id="contact" className="bg-white py-32 px-6">
        <div className="max-w-4xl mx-auto text-center py-20 bg-teal-50 rounded-[3rem] border border-teal-100">
          <Reveal>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl text-teal-600">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Message Received</h2>
            <p className="text-slate-700 text-lg max-w-md mx-auto leading-relaxed">
              One of our guides from Rishikesh will get back to you within 24 hours. Namaste.
            </p>
            <Button 
              onClick={() => setFormState('idle')} 
              variant="outline" 
              className="mt-10 rounded-full"
            >
              Send Another Message
            </Button>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="bg-white py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          
          {/* Left Side: Information */}
          <div className="space-y-12">
            <Reveal>
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.4em] mb-4 block">
                Get in Touch
              </span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-8 tracking-tighter leading-tight">
                Connect with the <br/>
                <span className="text-teal-600 italic">Source.</span>
              </h2>
              <p className="text-lg text-slate-600 font-light leading-relaxed max-w-lg">
                Have questions about the 6-month journey or need technical support? Our team in Rishikesh is here to guide you.
              </p>
            </Reveal>

            <div className="space-y-8">
              <Reveal delay={0.1}>
                <div className="flex gap-6 items-start group">
                  <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Us</h4>
                    <p className="text-lg font-medium text-slate-900">parth@yogaflow.com</p>
                    <p className="text-sm text-slate-500">Average response: 4 hours</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="flex gap-6 items-start group">
                  <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp Support</h4>
                    <p className="text-lg font-medium text-slate-900">+91 844 577 2880</p>
                    <p className="text-sm text-slate-500">Available 9AM - 6PM IST</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="flex gap-6 items-start group">
                  <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rishikesh HQ</h4>
                    <p className="text-lg font-medium text-slate-900">Adishakti Yogashala</p>
                    <p className="text-sm text-slate-500">Laxman Jhula, Uttarakhand, India</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="relative">
            <Reveal delay={0.4}>
              <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {formState === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">Error sending message</p>
                        <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        required
                        name="name"
                        type="text" 
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Arjun Sharma"
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        required
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="arjun@example.com"
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Inquiry Type</label>
                    <select 
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option>General Inquiry</option>
                      <option>Membership & Billing</option>
                      <option>Technical Support</option>
                      <option>Teacher Training</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Your Message</label>
                    <textarea 
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="How can we assist your practice today?"
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                    ></textarea>
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    className="w-full rounded-full group py-5"
                    disabled={formState === 'submitting'}
                  >
                    {formState === 'submitting' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
