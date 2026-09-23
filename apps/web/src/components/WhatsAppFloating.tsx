'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export function WhatsAppFloating() {
  return (
    <a
      href="https://wa.me/5515988145050?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20um%20im%C3%B3vel."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 group"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </div>
      <span className="font-semibold text-sm hidden sm:inline-block pr-1 tracking-wide">
        Fale no WhatsApp
      </span>
    </a>
  );
}
