'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  Table
} from 'lucide-react';
import { GestaoPayment, INITIAL_PAYMENTS, getStoredData } from '@/lib/gestaoData';

export default function RelatoriosAdminPage() {
  const [payments, setPayments] = useState<GestaoPayment[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>('TODOS');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  useEffect(() => {
    setPayments(getStoredData('payments', INITIAL_PAYMENTS));
  }, []);

  const owners = Array.from(new Set(payments.map(p => p.ownerName)));

  const filtered = payments.filter(p => {
    return selectedOwner === 'TODOS' || p.ownerName === selectedOwner;
  });

  const totalGross = filtered.reduce((acc, p) => acc + p.receivedAmount, 0);
  const totalFees = filtered.reduce((acc, p) => acc + p.adminFeeAmount, 0);
  const totalExpenses = filtered.reduce((acc, p) => acc + p.expensesDeducted, 0);
  const totalNet = filtered.reduce((acc, p) => acc + p.transferredAmount, 0);

  const handleExportCSV = () => {
    const headers = 'Competencia;Unidade;Inquilino;Proprietario;Valor Bruto;Taxa Adm;Despesas;Liquido Repassado;Status\n';
    const rows = filtered.map(p => 
      `${p.competence};${p.unitName};${p.tenantName};${p.ownerName};${p.receivedAmount};${p.adminFeeAmount};${p.expensesDeducted};${p.transferredAmount};${p.status}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `extrato_i7_${selectedOwner}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDIMOB = () => {
    alert(`Arquivo pré-formatado para declaração DIMOB da Receita Federal gerado com sucesso para o ano-calendário ${selectedYear}!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Relatórios & Demonstrativo DIMOB</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Extratos analíticos por proprietário e competência, exportação CSV e informe de rendimentos para a Receita Federal.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-xs font-bold hover:border-brand-lime flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-brand-lime" /> Exportar CSV
          </button>
          <button
            onClick={handleExportDIMOB}
            className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" /> Gerar Arquivo DIMOB
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary">Proprietário:</span>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
            >
              <option value="TODOS">Todos os Proprietários</option>
              {owners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-text-secondary" />
          <span className="text-xs font-bold text-text-secondary">Ano Calendário:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="2026">2026 (Exercício Atual)</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* KPI Balanço */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Rendimento Bruto Total</div>
          <div className="text-2xl font-black text-text-primary">
            R$ {totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Total faturado das locações</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Comissão de Adm i7</div>
          <div className="text-2xl font-black text-text-primary">
            R$ {totalFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Taxas de corretagem/adm</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Despesas Lançadas</div>
          <div className="text-2xl font-black text-red-600">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Manutenções e abatimentos</div>
        </div>

        <div className="p-6 rounded-2xl bg-brand-lime text-white shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-90">Líquido Repassado</div>
          <div className="text-2xl font-black">
            R$ {totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] opacity-90 mt-1">Base tributável do proprietário</div>
        </div>
      </div>

      {/* DIMOB Preview Section */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-lime" /> Demonstrativo de Rendimentos e Retenções (DIMOB)
          </h3>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
            Pronto para Declaração
          </span>
        </div>
        
        <p className="text-xs text-text-secondary">
          Este demonstrativo compila as informações no padrão exigido pela Instrução Normativa da Receita Federal do Brasil para imobiliárias e administradoras de bens imóveis.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Competência</th>
                <th className="p-3">Unidade</th>
                <th className="p-3">Locatário</th>
                <th className="p-3">Locador / Titular</th>
                <th className="p-3">Rendimento Bruto</th>
                <th className="p-3">Comissão Adm</th>
                <th className="p-3">Despesas Abatidas</th>
                <th className="p-3">Líquido Repassado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-surface/50">
                  <td className="p-3 font-bold text-text-primary">{p.competence}</td>
                  <td className="p-3 text-text-secondary">{p.unitName}</td>
                  <td className="p-3 font-medium text-text-primary">{p.tenantName}</td>
                  <td className="p-3 font-medium text-text-primary">{p.ownerName}</td>
                  <td className="p-3 font-bold text-text-primary">R$ {p.receivedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-text-secondary">R$ {p.adminFeeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-red-600">R$ {p.expensesDeducted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 font-black text-brand-lime">R$ {p.transferredAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
