'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, Wrench, Shield, Home } from 'lucide-react';
import { getCurrentSession, UserSession } from '@/lib/auth';

export default function AdminDashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const s = getCurrentSession();
    setSession(s);
  }, []);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-text-secondary font-medium">Carregando painel admin...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Painel do Administrador</h1>
          <p className="text-sm text-text-secondary mt-1">Gestão global da imobiliária i7</p>
        </div>
        <div className="flex gap-4">
          <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" /> ADMIN
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dash Cards */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <Home className="w-5 h-5" /> <span className="font-bold text-sm">Imóveis Ativos</span>
          </div>
          <div className="text-3xl font-black text-text-primary">124</div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <Users className="w-5 h-5" /> <span className="font-bold text-sm">Clientes</span>
          </div>
          <div className="text-3xl font-black text-text-primary">89</div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <FileText className="w-5 h-5" /> <span className="font-bold text-sm">Contratos</span>
          </div>
          <div className="text-3xl font-black text-text-primary">45</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <Wrench className="w-5 h-5" /> <span className="font-bold text-sm">Chamados Abertos</span>
          </div>
          <div className="text-3xl font-black text-text-primary">12</div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm mt-6">
        <h3 className="text-base font-bold text-text-primary mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-xl bg-surface-hover border border-border flex items-center justify-between hover:border-brand-lime transition-colors">
            <span className="font-bold text-sm text-text-primary">Gestão de Usuários</span>
            <Users className="w-4 h-4 text-brand-lime" />
          </button>
          <button className="p-4 rounded-xl bg-surface-hover border border-border flex items-center justify-between hover:border-brand-lime transition-colors">
            <span className="font-bold text-sm text-text-primary">Emissão de Boletos</span>
            <DollarSign className="w-4 h-4 text-brand-lime" />
          </button>
          <button className="p-4 rounded-xl bg-surface-hover border border-border flex items-center justify-between hover:border-brand-lime transition-colors">
            <span className="font-bold text-sm text-text-primary">Auditoria (Logs)</span>
            <Shield className="w-4 h-4 text-brand-lime" />
          </button>
        </div>
      </div>
    </div>
  );
}
