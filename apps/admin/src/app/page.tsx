'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, DollarSign, Users, Building2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [propertiesQueue, setPropertiesQueue] = useState([
    {
      id: 'prop-rev-1',
      title: 'Studio Tech em Pinheiros com Automação',
      owner: 'Carlos Alberto Silva',
      price: 3800,
      neighborhood: 'Pinheiros, SP',
      date: '29/07/2026',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'prop-rev-2',
      title: 'Apartamento Duplex Jardins',
      owner: 'Fernando Mendes',
      price: 7200,
      neighborhood: 'Jardins, SP',
      date: '29/07/2026',
      status: 'UNDER_REVIEW',
    },
  ]);

  const handleApprove = (id: string) => {
    setPropertiesQueue(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#2B3145] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#161922] border border-[#B4FF39] flex items-center justify-center font-bold text-xl text-[#B4FF39]">
            i7
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo i7 Back-Office</h1>
            <p className="text-xs text-gray-400">Moderação de Imóveis, Gestão de Repasses e Controle Financeiro</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B4FF39]/20 text-[#B4FF39] border border-[#B4FF39]/30">
          Modo Admin Ativo
        </span>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#161922] border border-[#2B3145]">
          <div className="text-xs font-bold text-gray-400 uppercase">Receita Bruta i7 (Mês)</div>
          <div className="text-2xl font-black text-white mt-2">R$ 148.500,00</div>
          <div className="text-[11px] text-[#B4FF39] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% em relação ao mês anterior
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#161922] border border-[#2B3145]">
          <div className="text-xs font-bold text-gray-400 uppercase">Fundo Aluguel Garantido</div>
          <div className="text-2xl font-black text-white mt-2">R$ 850.000,00</div>
          <div className="text-[11px] text-gray-400 mt-1">Reserva de garantia de repasses aos proprietários</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#161922] border border-[#2B3145]">
          <div className="text-xs font-bold text-gray-400 uppercase">Imóveis Ativos na Plataforma</div>
          <div className="text-2xl font-black text-white mt-2">1.420</div>
          <div className="text-[11px] text-gray-400 mt-1">SP, RJ e Curitiba</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#161922] border border-[#2B3145]">
          <div className="text-xs font-bold text-gray-400 uppercase">Anúncios Pendentes</div>
          <div className="text-2xl font-black text-[#B4FF39] mt-2">{propertiesQueue.length} em análise</div>
          <div className="text-[11px] text-gray-400 mt-1">Moderação técnica obrigatória</div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="p-6 rounded-2xl bg-[#161922] border border-[#2B3145] space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#B4FF39]" /> Fila de Moderação de Anúncios de Proprietários
        </h2>

        {propertiesQueue.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            Nenhum imóvel pendente de moderação no momento.
          </div>
        ) : (
          <div className="divide-y divide-[#2B3145]">
            {propertiesQueue.map(p => (
              <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white">{p.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Proprietário: {p.owner} • {p.neighborhood} • Aluguel: R$ {p.price.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleApprove(p.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#B4FF39] text-[#0F1115] hover:bg-[#9EE627] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprovar Anúncio
                  </button>
                  <button 
                    onClick={() => handleApprove(p.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Solicitar Ajuste
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
