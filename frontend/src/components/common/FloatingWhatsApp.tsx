import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { brandConfig } = useApp();

  const phoneNumber = brandConfig.supportPhone ? brandConfig.supportPhone.replace(/[^0-9]/g, '') : '919876543210';
  const cleanPhone = phoneNumber || '919876543210';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Namaste%20Akshar%20Mandir,%20I%20would%20like%20to%20inquire%20about%20your%20handcrafted%20home%20mandirs.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:scale-110 transition-all duration-300 flex items-center gap-2 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold px-0 group-hover:px-1">
        Mandir Specialist
      </span>
    </a>
  );
};
