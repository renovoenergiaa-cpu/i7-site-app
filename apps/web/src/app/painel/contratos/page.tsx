'use client';

import React from 'react';
import { FileText, Plus, Search, CheckCircle2 } from 'lucide-react';

export default function ContractsAdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Contratos de Locação</h1>
          <p className="text-sm text-text-secondary mt-1">Gere novos contratos e acompanhe a vigência dos atuais</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-lime text-white hover:bg-brand-lime-hover transition-colors shadow-md flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Novo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Contratos Ativos</div>
          <div className="text-3xl font-black text-brand-lime">45</div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Vencendo em 30 dias</div>
          <div className="text-3xl font-black text-yellow-500">2</div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Assinaturas Pendentes</div>
          <div className="text-3xl font-black text-text-primary">1</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col justify-center items-center py-20 text-center">
          <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-4 text-text-muted">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Integração Pronta para API</h3>
          <p className="text-sm text-text-secondary mt-2 max-w-md">
            Esta tabela será populada automaticamente quando o backend estiver retornando os contratos reais criados na plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
