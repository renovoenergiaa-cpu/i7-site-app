'use client';

import React from 'react';
import { DollarSign, ArrowDownRight, ArrowUpRight, Plus, Download } from 'lucide-react';

export default function FinanceAdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Financeiro (Asaas)</h1>
          <p className="text-sm text-text-secondary mt-1">Gestão de recebimentos de boletos e repasses a proprietários</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-lime text-white hover:bg-brand-lime-hover transition-colors shadow-md flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Gerar Cobrança Avulsa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-green-500" /> A Receber (Mês)
          </div>
          <div className="text-2xl font-black text-text-primary">R$ 145.200,00</div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-red-500" /> Repasses Previstos
          </div>
          <div className="text-2xl font-black text-text-primary">R$ 128.500,00</div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Inadimplência</div>
          <div className="text-2xl font-black text-red-500">2.4%</div>
        </div>
        <div className="p-6 rounded-2xl bg-brand-lime text-white shadow-md">
          <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-90">Receita Bruta i7</div>
          <div className="text-2xl font-black">R$ 16.700,00</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden p-6 text-center py-20">
        <div className="w-16 h-16 bg-brand-lime/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-lime">
          <DollarSign className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">Aguardando Chaves do Asaas</h3>
        <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
          Para que a lista de boletos e transferências de split de pagamentos apareça aqui em tempo real, configure a chave de API do Asaas no `.env` do backend.
        </p>
      </div>
    </div>
  );
}
