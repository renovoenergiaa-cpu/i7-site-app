'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, MessageSquare, UserCircle, Building2, Menu, X, LogOut, ShieldCheck, Mail } from 'lucide-react';
import { getCurrentSession, logoutUser, UserSession } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setSession(getCurrentSession());
  }, []);

  const handleLogout = () => {
    logoutUser();
    setSession(null);
    window.location.href = '/';
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'i7';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-border/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo i7 */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-full bg-surface border border-brand-lime/30 flex items-center justify-center shadow-glow-lime group-hover:scale-105 transition-transform duration-200">
            <span className="font-sans text-xl font-black text-brand-lime tracking-tighter">i7</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-lime border-2 border-background animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold font-sans text-text-primary tracking-wider uppercase group-hover:text-brand-lime transition-colors">
              INTELIGÊNCIA IMOBILIÁRIA
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <Link href="/imoveis" className="hover:text-brand-lime flex items-center gap-2 transition-colors">
            <Search className="w-4 h-4 text-brand-lime" />
            Buscar Imóveis
          </Link>
          <Link href="/imoveis?type=APARTMENT" className="hover:text-brand-lime transition-colors">
            Apartamentos
          </Link>
          <Link href="/anunciar" className="hover:text-brand-lime flex items-center gap-2 transition-colors font-bold">
            <Building2 className="w-4 h-4 text-brand-lime" />
            Anuncie seu Imóvel
          </Link>
          <Link href="/contato" className="hover:text-brand-lime flex items-center gap-2 transition-colors">
            <Mail className="w-4 h-4 text-brand-lime" />
            Fale Conosco
          </Link>
        </nav>

        {/* User Quick Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/favoritos" className="p-2.5 rounded-xl bg-surface/80 border border-border hover:border-brand-lime/50 text-text-secondary hover:text-brand-lime transition-all">
            <Heart className="w-4 h-4" />
          </Link>
          
          {session ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/painel" 
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-brand-lime/50 transition-all group"
              >
                <UserCircle className="w-5 h-5 text-text-secondary group-hover:text-brand-lime transition-colors" />
                <span className="text-xs font-bold text-text-primary max-w-[120px] truncate">
                  {session.user.name || 'Minha Conta'}
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                title="Sair"
                className="p-2.5 rounded-xl bg-surface-card border border-border hover:border-red-500/50 text-text-secondary hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-brand-lime text-background hover:bg-brand-lime-hover shadow-glow-lime transition-all flex items-center gap-2"
            >
              <UserCircle className="w-4 h-4" />
              Entrar / Cadastrar
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-border px-6 py-6 space-y-4">
          <Link 
            href="/imoveis" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-base font-medium text-text-primary hover:text-brand-lime"
          >
            <Search className="w-5 h-5 text-brand-lime" />
            Buscar Imóveis
          </Link>
          <Link 
            href="/contato" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-base font-medium text-text-primary hover:text-brand-lime"
          >
            <Mail className="w-5 h-5 text-brand-lime" />
            Fale Conosco
          </Link>
          <Link 
            href="/painel" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-base font-medium text-text-primary hover:text-brand-lime"
          >
            <ShieldCheck className="w-5 h-5 text-brand-lime" />
            Meu Painel / Contratos
          </Link>

          <div className="pt-4 border-t border-border/60 flex flex-col gap-3">
            {session ? (
              <button 
                onClick={handleLogout}
                className="w-full text-center py-3 rounded-xl font-bold bg-surface-card border border-red-500/40 text-red-400"
              >
                Sair da Conta ({session.user.name})
              </button>
            ) : (
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl font-bold bg-brand-lime text-background shadow-glow-lime"
              >
                Entrar ou Criar Conta
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
