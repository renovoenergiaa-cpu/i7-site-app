import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface/90 border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Grid Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface border border-brand-lime/40 flex items-center justify-center">
                <span className="font-black text-lg text-brand-lime">i7</span>
              </div>
              <span className="text-xl font-bold text-text-primary tracking-wide">Inteligência Imobiliária</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Plataforma digital de Inteligência Imobiliária. Tecnologia moderna, burocracia zero e segurança completa para locação e compra de imóveis.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Lock className="w-3.5 h-3.5 text-brand-lime" />
                Contratos com Assinatura Eletrônica Válida
              </div>
              <a
                href="https://wa.me/5515988145050"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold w-fit"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp: (15) 98814-5050</span>
              </a>
            </div>
          </div>

          {/* Locatários */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-4 text-brand-lime">Locatários & Compradores</h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li><Link href="/imoveis" className="hover:text-brand-lime transition-colors">Buscar imóveis por bairro</Link></li>
              <li><Link href="/imoveis?type=STUDIO" className="hover:text-brand-lime transition-colors">Studios e Kitnets mobiliadas</Link></li>
              <li><Link href="/imoveis?petFriendly=true" className="hover:text-brand-lime transition-colors">Imóveis Pet Friendly</Link></li>
              <li><Link href="/imoveis?hasVirtualTour=true" className="hover:text-brand-lime transition-colors">Visita Virtual</Link></li>
              <li><Link href="/painel" className="hover:text-brand-lime transition-colors">Segunda via de Boleto/PIX</Link></li>
              <li><Link href="/contato" className="hover:text-brand-lime font-bold transition-colors">Fale Conosco / Atendimento</Link></li>
            </ul>
          </div>

          {/* Proprietários */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-4 text-brand-lime">Proprietários & Parceiros</h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li><Link href="/anunciar" className="hover:text-brand-lime transition-colors">Anunciar meu imóvel grátis</Link></li>
              <li><Link href="/anunciar" className="hover:text-brand-lime transition-colors">Como funciona a Avaliação</Link></li>
              <li><Link href="/corretores" className="hover:text-brand-lime transition-colors">Seja um Corretor Parceiro</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© 2026 Inteligência Imobiliária S.A. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-text-secondary">Termos de Uso</Link>
            <Link href="#" className="hover:text-text-secondary">Política de Privacidade</Link>
            <Link href="#" className="hover:text-text-secondary">Segurança KYC</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
