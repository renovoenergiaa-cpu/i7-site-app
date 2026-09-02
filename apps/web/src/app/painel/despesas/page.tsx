'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  ArrowDownRight, 
  CheckCircle2, 
  FileText, 
  X,
  Trash2
} from 'lucide-react';
import { GestaoExpense, INITIAL_EXPENSES, getStoredData, saveStoredData } from '@/lib/gestaoData';

export default function DespesasAdminPage() {
  const [expenses, setExpenses] = useState<GestaoExpense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New expense form
  const [newDescription, setNewDescription] = useState('');
  const [newUnit, setNewUnit] = useState('Sala 101 - Paulista Corporate');
  const [newOwner, setNewOwner] = useState('Eduardo Silveira Ramos');
  const [newCategory, setNewCategory] = useState<'MANUTENCAO' | 'IPTU' | 'CONDOMINIO' | 'TAXA_EXTRA' | 'JURIDICO'>('MANUTENCAO');
  const [newAmount, setNewAmount] = useState(250);
  const [newReceipt, setNewReceipt] = useState('');

  useEffect(() => {
    setExpenses(getStoredData('expenses', INITIAL_EXPENSES));
  }, []);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription) return;

    const newExp: GestaoExpense = {
      id: `exp-${Date.now()}`,
      description: newDescription,
      unitName: newUnit,
      ownerName: newOwner,
      category: newCategory,
      amount: Number(newAmount),
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'LANCADO',
      receiptNumber: newReceipt || `REC-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveStoredData('expenses', updated);
    setIsModalOpen(false);
    setNewDescription('');
    setNewReceipt('');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Deseja cancelar este lançamento de despesa?')) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      saveStoredData('expenses', updated);
    }
  };

  const filtered = expenses.filter(e => {
    const matchesSearch = 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Despesas & Lançamentos em Extrato</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Lançamento de despesas operacionais (manutenções, cotas extras, taxas) a serem deduzidas do repasse ao proprietário.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento de Despesa
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Total Lançado no Mês</div>
          <div className="text-2xl font-black text-red-600">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Comprovantes vinculados aos repasses</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Descontados do Repasse</div>
          <div className="text-2xl font-black text-emerald-600">
            {expenses.filter(e => e.status === 'DESCONTADO_REPASSE').length} lançamentos
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Já compensados na conciliação</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Pendentes de Desconto</div>
          <div className="text-2xl font-black text-amber-500">
            {expenses.filter(e => e.status === 'LANCADO').length} lançamentos
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Entrarão no próximo ciclo de repasse</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição, unidade ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="MANUTENCAO">Manutenção / Reparos</option>
            <option value="CONDOMINIO">Condomínio / Cota Extra</option>
            <option value="IPTU">IPTU</option>
            <option value="TAXA_EXTRA">Taxas Extras</option>
            <option value="JURIDICO">Honorários Jurídicos</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Descrição da Despesa</th>
              <th className="p-4">Unidade / Proprietário</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Comprovante</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(exp => (
              <tr key={exp.id} className="hover:bg-surface/50 transition-colors">
                <td className="p-4 font-bold text-text-primary">{exp.date}</td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{exp.description}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{exp.unitName}</div>
                  <div className="text-[11px] text-text-secondary">Prop: {exp.ownerName}</div>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface border border-border text-text-primary">
                    {exp.category}
                  </span>
                </td>
                <td className="p-4 font-black text-red-600">
                  - R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-text-secondary font-mono">
                  {exp.receiptNumber || '—'}
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    exp.status === 'DESCONTADO_REPASSE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {exp.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Excluir lançamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nova Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Lançar Despesa em Extrato</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Descrição do Serviço / Despesa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de disjuntor e reparo de tomada"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Unidade</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Proprietário</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="MANUTENCAO">Manutenção / Reparo</option>
                    <option value="CONDOMINIO">Condomínio / Cota Extra</option>
                    <option value="IPTU">IPTU</option>
                    <option value="TAXA_EXTRA">Taxa Extraordinária</option>
                    <option value="JURIDICO">Jurídico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Valor do Débito (R$)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Nº Nota Fiscal / Comprovante</label>
                <input
                  type="text"
                  placeholder="Ex: NF-e 98402 ou Recibo 12/2026"
                  value={newReceipt}
                  onChange={(e) => setNewReceipt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
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
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
