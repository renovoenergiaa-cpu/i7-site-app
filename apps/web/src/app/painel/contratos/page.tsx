'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Calendar, Shield, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { GestaoContract, INITIAL_CONTRACTS, getStoredData, saveStoredData } from '@/lib/gestaoData';

export default function ContratosAdminPage() {
  const [contracts, setContracts] = useState<GestaoContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newCode, setNewCode] = useState(`CTR-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newUnit, setNewUnit] = useState('Conjunto 401 - Pinheiros Hub');
  const [newTenantName, setNewTenantName] = useState('Clínica Bem Estar Médica');
  const [newTenantEmail, setNewTenantEmail] = useState('atendimento@clinicabemestar.med.br');
  const [newOwnerName, setNewOwnerName] = useState('Dr. Paulo Albuquerque');
  const [newOwnerEmail, setNewOwnerEmail] = useState('paulo.albuquerque@advocacia.com');
  const [newStartDate, setNewStartDate] = useState('01/09/2026');
  const [newEndDate, setNewEndDate] = useState('31/08/2029');
  const [newAmount, setNewAmount] = useState(9500);
  const [newIndex, setNewIndex] = useState<'IPCA' | 'IGP-M' | 'INPC'>('IPCA');
  const [newGuarantee, setNewGuarantee] = useState<'CAUCAO' | 'SEGURO_FIANCA' | 'FIADOR' | 'TITULO_CAP'>('SEGURO_FIANCA');
  const [newFine, setNewFine] = useState(10);
  const [newInterest, setNewInterest] = useState(1);

  useEffect(() => {
    setContracts(getStoredData('contracts', INITIAL_CONTRACTS));
  }, []);

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const newContract: GestaoContract = {
      id: `cnt-${Date.now()}`,
      code: newCode,
      unitName: newUnit,
      tenantName: newTenantName,
      tenantEmail: newTenantEmail,
      ownerName: newOwnerName,
      ownerEmail: newOwnerEmail,
      startDate: newStartDate,
      endDate: newEndDate,
      monthlyAmount: Number(newAmount),
      adjustmentIndex: newIndex,
      guaranteeType: newGuarantee,
      finePercent: Number(newFine),
      interestPercent: Number(newInterest),
      status: 'ATIVO'
    };

    const updated = [newContract, ...contracts];
    setContracts(updated);
    saveStoredData('contracts', updated);
    setIsModalOpen(false);
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Contratos de Locação</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Gestão de vigência, reajustes anuais (IPCA/IGP-M), garantia contratual, multas e renovações.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Contrato de Locação
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Contratos Ativos</div>
          <div className="text-2xl font-black text-brand-lime">
            {contracts.filter(c => c.status === 'ATIVO').length}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Garantindo receita recorrente</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Renovação Pendente</div>
          <div className="text-2xl font-black text-amber-500">
            {contracts.filter(c => c.status === 'RENOVAÇÃO_PENDENTE').length}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Vencendo nos próximos 60 dias</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Garantia Mais Utilizada</div>
          <div className="text-2xl font-black text-text-primary">
            Seguro Fiança
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Zero inadimplência repassada</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código CTR, unidade, inquilino ou proprietário..."
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
            <option value="ATIVO">Ativos</option>
            <option value="RENOVAÇÃO_PENDENTE">Renovação Pendente</option>
            <option value="ENCERRADO">Encerrados</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Contrato</th>
              <th className="p-4">Unidade / Imóvel</th>
              <th className="p-4">Inquilino</th>
              <th className="p-4">Proprietário</th>
              <th className="p-4">Vigência</th>
              <th className="p-4">Aluguel Mensal</th>
              <th className="p-4">Reajuste / Garantia</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredContracts.map((cnt) => (
              <tr key={cnt.id} className="hover:bg-surface/50 transition-colors">
                <td className="p-4 font-mono font-bold text-text-primary">
                  {cnt.code}
                </td>
                <td className="p-4 font-bold text-text-primary">
                  {cnt.unitName}
                </td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{cnt.tenantName}</div>
                  <div className="text-[11px] text-text-secondary">{cnt.tenantEmail}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{cnt.ownerName}</div>
                  <div className="text-[11px] text-text-secondary">{cnt.ownerEmail}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{cnt.startDate} a {cnt.endDate}</div>
                  <div className="text-[11px] text-text-secondary">Multa: {cnt.finePercent}% • Juros: {cnt.interestPercent}% a.m.</div>
                </td>
                <td className="p-4 font-black text-brand-lime">
                  R$ {cnt.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-text-primary mr-1">
                    {cnt.adjustmentIndex}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-text-secondary">
                    {cnt.guaranteeType.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    cnt.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' :
                    cnt.status === 'RENOVAÇÃO_PENDENTE' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {cnt.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Contrato */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Cadastrar Novo Contrato</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Código do Contrato</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Valor do Aluguel (R$)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Unidade / Imóvel</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Nome do Inquilino</label>
                  <input
                    type="text"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">E-mail do Inquilino</label>
                  <input
                    type="email"
                    value={newTenantEmail}
                    onChange={(e) => setNewTenantEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Data de Início</label>
                  <input
                    type="text"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Data de Término</label>
                  <input
                    type="text"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Índice de Reajuste</label>
                  <select
                    value={newIndex}
                    onChange={(e: any) => setNewIndex(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="IPCA">IPCA</option>
                    <option value="IGP-M">IGP-M</option>
                    <option value="INPC">INPC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Garantia Locatícia</label>
                  <select
                    value={newGuarantee}
                    onChange={(e: any) => setNewGuarantee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="SEGURO_FIANCA">Seguro Fiança</option>
                    <option value="CAUCAO">Caução</option>
                    <option value="FIADOR">Fiador</option>
                    <option value="TITULO_CAP">Título de Capitalização</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md"
                >
                  Salvar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
