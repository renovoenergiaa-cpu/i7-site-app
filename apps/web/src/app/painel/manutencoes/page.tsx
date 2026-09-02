'use client';

import React from 'react';
import { Wrench, Clock, AlertCircle } from 'lucide-react';

export default function MaintenanceAdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 h-[90vh] flex flex-col">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Gestão de Chamados</h1>
        <p className="text-sm text-text-secondary mt-1">Controle de manutenções e solicitações de clientes</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Coluna Abertos */}
        <div className="flex flex-col bg-surface-hover/30 rounded-2xl border border-border p-4 h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">Novos Abertos</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold text-xs">2</span>
          </div>
          
          <div className="space-y-3 overflow-y-auto pr-1">
            <div className="p-4 rounded-xl bg-white border border-border shadow-sm cursor-grab hover:border-brand-lime transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Urgente</span>
                <span className="text-xs text-text-muted">Apt 104</span>
              </div>
              <h4 className="font-bold text-sm text-text-primary">Vazamento no banheiro</h4>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">Inquilino reportou que o cano da pia estourou durante a madrugada...</p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-text-muted">
                <span>João S. (Inquilino)</span>
                <Clock className="w-3 h-3" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-border shadow-sm cursor-grab hover:border-brand-lime transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">Normal</span>
                <span className="text-xs text-text-muted">Casa 12</span>
              </div>
              <h4 className="font-bold text-sm text-text-primary">Troca de lâmpadas externas</h4>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">Lâmpadas do jardim não estão acendendo.</p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-text-muted">
                <span>Maria P. (Inquilina)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Em Atendimento */}
        <div className="flex flex-col bg-surface-hover/30 rounded-2xl border border-border p-4 h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">Em Andamento</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold text-xs">1</span>
          </div>
          
          <div className="space-y-3 overflow-y-auto pr-1">
             <div className="p-4 rounded-xl bg-white border border-border shadow-sm cursor-grab border-l-4 border-l-brand-lime">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">Normal</span>
                <span className="text-xs text-text-muted">Apt 302</span>
              </div>
              <h4 className="font-bold text-sm text-text-primary">Ar Condicionado sem gelar</h4>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-text-muted">
                <span>Técnico Roberto (i7)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Concluídos */}
        <div className="flex flex-col bg-surface-hover/30 rounded-2xl border border-border p-4 h-full">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">Resolvidos</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold text-xs">0</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50">
            <Wrench className="w-8 h-8 mb-2" />
            <p className="text-xs font-bold text-center">Nenhum chamado concluído recentemente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
