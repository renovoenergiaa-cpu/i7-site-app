'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  FileCheck,
  Send
} from 'lucide-react';
import { GestaoPayment, INITIAL_PAYMENTS, getStoredData, saveStoredData } from '@/lib/gestaoData';

export default function PagamentosConciliacaoPage() {
  const [payments, setPayments] = useState<GestaoPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setPayments(getStoredData('payments', INITIAL_PAYMENTS));
  }, []);

  const totalExpected = payments.reduce((acc, p) => acc + p.expectedAmount, 0);
  const totalReceived = payments.reduce((acc, p) => acc + p.receivedAmount, 0);
  const totalTransferred = payments.reduce((acc, p) => acc + p.transferredAmount, 0);
  const totalAdminFees = payments.reduce((acc, p) => acc + p.adminFeeAmount, 0);

  const handleExecuteTransfer = (id: string) => {
    const updated = payments.map(p => {
      if (p.id === id) {
        const netTransfer = p.receivedAmount - p.adminFeeAmount - p.expensesDeducted;
        return {
          ...p,
          transferredAmount: netTransfer,
          status: 'CONCILIADO' as const,
          transferDate: new Date().toLocaleDateString('pt-BR'),
          transferReceiptUrl: `https://comprovantes.i7.com.br/repasse-novo-${id}.pdf`
        };
      }
      return p;
    });
    setPayments(updated);
    saveStoredData('payments', updated);
    alert('Repasse PIX programado com sucesso via Asaas!');
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Pagamentos & Conciliação</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Controle de fluxo financeiro: Previsto x Recebido do Inquilino x Repassado Líquido ao Proprietário.
          </p>
        </div>

        <button 
          onClick={() => alert('Relatório analítico de conciliação exportado em CSV com sucesso!')}
          className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-xs font-bold hover:border-brand-lime flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Exportar Extrato de Conciliação
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Total Previsto</div>
          <div className="text-2xl font-black text-text-primary">
            R$ {totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Soma de todos os contratos ativos</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" /> Recebido (Liquidados)
          </div>
          <div className="text-2xl font-black text-emerald-600">
            R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Entrada confirmada na conta Asaas</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-blue-600" /> Repassado a Proprietários
          </div>
          <div className="text-2xl font-black text-blue-600">
            R$ {totalTransferred.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Transferências PIX executadas</div>
        </div>

        <div className="p-6 rounded-2xl bg-brand-lime text-white shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-90">Taxa de Gestão i7</div>
          <div className="text-2xl font-black">
            R$ {totalAdminFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] opacity-90 mt-1">Honorários de administração retidos</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por unidade, proprietário ou inquilino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="ALL">Todos os Status</option>
            <option value="CONCILIADO">Conciliados (Repasse Feito)</option>
            <option value="RECEBIDO_PENDENTE_REPASSE">Recebido (Pendente Repasse)</option>
            <option value="INADIMPLENTE">Inadimplente</option>
          </select>
        </div>
      </div>

      {/* Conciliation Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Competência</th>
              <th className="p-4">Unidade / Partes</th>
              <th className="p-4">Previsto</th>
              <th className="p-4">Recebido</th>
              <th className="p-4">Taxa Adm i7</th>
              <th className="p-4">Despesas</th>
              <th className="p-4">Líquido Repassado</th>
              <th className="p-4">Status / Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                <td className="p-4 font-bold text-text-primary">
                  {p.competence}
                </td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{p.unitName}</div>
                  <div className="text-[11px] text-text-secondary">
                    Inq: {p.tenantName} • Prop: {p.ownerName}
                  </div>
                </td>
                <td className="p-4 font-bold text-text-secondary">
                  R$ {p.expectedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 font-black text-emerald-600">
                  R$ {p.receivedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-text-secondary">
                  - R$ {p.adminFeeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-red-600 font-semibold">
                  {p.expensesDeducted > 0 ? `- R$ ${p.expensesDeducted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                </td>
                <td className="p-4 font-black text-blue-600">
                  R$ {p.transferredAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4">
                  {p.status === 'CONCILIADO' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                        Conciliado
                      </span>
                      {p.transferReceiptUrl && (
                        <a 
                          href={p.transferReceiptUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          title="Comprovante de Repasse"
                          className="p-1 rounded text-text-secondary hover:text-brand-lime"
                        >
                          <FileCheck className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}

                  {p.status === 'RECEBIDO_PENDENTE_REPASSE' && (
                    <button
                      onClick={() => handleExecuteTransfer(p.id)}
                      className="px-2.5 py-1 rounded-lg bg-brand-lime text-white text-[11px] font-bold hover:bg-brand-lime-hover shadow-sm flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Fazer Repasse
                    </button>
                  )}

                  {p.status === 'INADIMPLENTE' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700">
                      Inadimplente
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
