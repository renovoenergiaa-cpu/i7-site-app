'use client';

import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Ban, 
  RotateCcw, 
  QrCode, 
  Copy, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { GestaoBoleto, INITIAL_BOLETOS, getStoredData, saveStoredData } from '@/lib/gestaoData';

export default function BoletosAdminPage() {
  const [boletos, setBoletos] = useState<GestaoBoleto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form for new boleto
  const [newUnit, setNewUnit] = useState('Sala 101 - Paulista Corporate');
  const [newTenant, setNewTenant] = useState('TechSolutions Brasil Ltda');
  const [newOwner, setNewOwner] = useState('Eduardo Silveira Ramos');
  const [newAmount, setNewAmount] = useState(6500);
  const [newDueDate, setNewDueDate] = useState('10/09/2026');

  useEffect(() => {
    setBoletos(getStoredData('boletos', INITIAL_BOLETOS));
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleUpdateStatus = (id: string, newStatus: GestaoBoleto['status']) => {
    const updated = boletos.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: newStatus,
          paidAt: newStatus === 'PAGO' ? new Date().toLocaleDateString('pt-BR') : b.paidAt
        };
      }
      return b;
    });
    setBoletos(updated);
    saveStoredData('boletos', updated);
  };

  const handleEmitBoleto = (e: React.FormEvent) => {
    e.preventDefault();
    const newBol: GestaoBoleto = {
      id: `bol-${Date.now()}`,
      code: `BOL-${Math.floor(1000 + Math.random() * 9000)}`,
      unitName: newUnit,
      tenantName: newTenant,
      ownerName: newOwner,
      amount: Number(newAmount),
      dueDate: newDueDate,
      status: 'EM_ABERTO',
      dunningStep: 'LEMBRETE_PREVIO',
      barCode: `34191.79001 01043.510047 91020.150008 5 ${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
      pixCode: `00020126580014br.gov.bcb.pix0136i7-asaas-${Date.now()}`
    };

    const updated = [newBol, ...boletos];
    setBoletos(updated);
    saveStoredData('boletos', updated);
    setIsModalOpen(false);
  };

  const handleSendReminder = (b: GestaoBoleto) => {
    alert(`Notificação de cobrança (WhatsApp / E-mail) reenviada com sucesso para ${b.tenantName}!`);
  };

  const filteredBoletos = boletos.filter(b => {
    const matchesSearch = 
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Boletos & Régua de Cobrança</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Emissão de cobranças, cancelamentos, estornos, régua automática de inadimplência e integração Asaas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Emitir Novo Boleto / Cobrança
        </button>
      </div>

      {/* Régua de Inadimplência Resumo */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
          Etapas da Régua Automatizada de Inadimplência (Asaas)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-600">D-3 Dias</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            </div>
            <div className="text-xs font-bold text-text-primary">Lembrete Prévio</div>
            <div className="text-[11px] text-text-secondary">E-mail e SMS com código PIX</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-brand-lime">D-0 (Hoje)</span>
              <span className="w-2 h-2 rounded-full bg-brand-lime"></span>
            </div>
            <div className="text-xs font-bold text-text-primary">Vencendo Hoje</div>
            <div className="text-[11px] text-text-secondary">Notificação de vencimento</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-600">D+3 Dias</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-xs font-bold text-text-primary">1º Aviso de Atraso</div>
            <div className="text-[11px] text-text-secondary">Aplicação de 10% multa + juros</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-orange-600">D+15 Dias</span>
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            </div>
            <div className="text-xs font-bold text-text-primary">Alerta Negativação</div>
            <div className="text-[11px] text-text-secondary">Notificação extrajudicial Serasa</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-red-600">D+30 Dias</span>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </div>
            <div className="text-xs font-bold text-text-primary">Ação Jurídica</div>
            <div className="text-[11px] text-text-secondary">Encaminhamento para execução</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, inquilino ou sala..."
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
            <option value="EM_ABERTO">Em Aberto</option>
            <option value="PAGO">Pagos / Liquidados</option>
            <option value="VENCIDO">Vencidos (Inadimplência)</option>
            <option value="CANCELADO">Cancelados</option>
            <option value="ESTORNADO">Estornados</option>
          </select>
        </div>
      </div>

      {/* Boletos Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Identificador</th>
              <th className="p-4">Inquilino / Unidade</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Vencimento</th>
              <th className="p-4">Régua / Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBoletos.map((bol) => (
              <tr key={bol.id} className="hover:bg-surface/50 transition-colors">
                <td className="p-4 font-mono font-bold text-text-primary">
                  {bol.code}
                </td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{bol.tenantName}</div>
                  <div className="text-[11px] text-text-secondary">{bol.unitName}</div>
                </td>
                <td className="p-4 font-black text-text-primary">
                  R$ {bol.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  {bol.fineApplied && bol.fineApplied > 0 && (
                    <div className="text-[10px] text-red-600 font-semibold">
                      + Multa: R$ {bol.fineApplied.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{bol.dueDate}</div>
                  {bol.daysOverdue && bol.daysOverdue > 0 && (
                    <div className="text-[10px] text-red-600 font-bold">
                      {bol.daysOverdue} dias de atraso
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    bol.status === 'PAGO' ? 'bg-emerald-100 text-emerald-700' :
                    bol.status === 'VENCIDO' ? 'bg-red-100 text-red-700' :
                    bol.status === 'CANCELADO' ? 'bg-gray-100 text-gray-500' :
                    bol.status === 'ESTORNADO' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {bol.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-right space-x-1">
                  {bol.status !== 'PAGO' && bol.status !== 'CANCELADO' && bol.status !== 'ESTORNADO' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(bol.id, 'PAGO')}
                        title="Marcar como Liquidado"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 text-[11px]"
                      >
                        Liquidar
                      </button>
                      <button
                        onClick={() => handleSendReminder(bol)}
                        title="Disparar Régua / Reenviar"
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 text-[11px]"
                      >
                        Cobrar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(bol.id, 'CANCELADO')}
                        title="Cancelar Cobrança"
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 text-[11px]"
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {bol.status === 'PAGO' && (
                    <button
                      onClick={() => handleUpdateStatus(bol.id, 'ESTORNADO')}
                      title="Estornar Pagamento"
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 text-[11px]"
                    >
                      Estornar
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(bol.barCode)}
                    title="Copiar Código de Barras"
                    className="p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary text-[11px]"
                  >
                    {copiedCode === bol.barCode ? <Check className="w-3.5 h-3.5 text-brand-lime" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Emitir Boleto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Emitir Cobrança / Boleto Asaas</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEmitBoleto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Unidade / Imóvel</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Inquilino (Sacado)</label>
                <input
                  type="text"
                  value={newTenant}
                  onChange={(e) => setNewTenant(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Vencimento</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800">
                A cobrança será gerada com QR Code PIX instantâneo e código de barras bancário com envio automático de régua de vencimento.
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
                  Emitir Cobrança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
