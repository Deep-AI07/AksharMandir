import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { brandConfig, showToast } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your inquiry has been received! Our mandir specialist will contact you within 24 hours.', 'success');
  };

  return (
    <div id="contact-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7b581e]">Customer Support</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1f1c1b]">
          Contact & Workshop Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Have questions regarding Vastu dimensions, timber selection, or white-glove mandir installation? Our master artisans are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-6 text-xs">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Mandir Workshop & Studio Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#570000] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1f1c1b] block text-sm">Artisan Ateliers & Workshops</strong>
                  <p className="text-gray-500">{brandConfig.workshopLocations || 'Woodcraft Heritage Corridor, Saharanpur (UP) & Bengaluru (KA), India'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#570000] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1f1c1b] block text-sm">Concierge Helpline / WhatsApp</strong>
                  <p className="text-gray-500">{brandConfig.supportPhone || '+91 98765 43210'}</p>
                  <p className="text-[11px] text-gray-400">Available Mon-Sat: 9:00 AM - 8:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#570000] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1f1c1b] block text-sm">Direct Email</strong>
                  <p className="text-gray-500">{brandConfig.supportEmail || 'care@aksharmandir.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#570000] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1f1c1b] block text-sm">Pan-India White Glove Dispatch</strong>
                  <p className="text-gray-500">Every mandir is carefully crated in wooden pallets and assembled in your home by our temple specialists.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-6">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Send Us an Inquiry</h3>

            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-lg text-[#1f1c1b]">Inquiry Submitted Successfully</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Thank you, <strong>{name}</strong>. Our mandir consultant will get back to you shortly at {email || phone}.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setName(''); setMessage(''); }}
                  className="px-6 py-2 rounded-xl bg-[#570000] text-white text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="uppercase font-bold text-gray-500 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                    />
                  </div>

                  <div>
                    <label className="uppercase font-bold text-gray-500 block mb-1">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                  />
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Inquiry / Custom Consultation Notes</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the mandir type, pooja room layout, or delivery requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold shadow-md flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
