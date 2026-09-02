'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Image as ImageIcon, 
  X,
  Eye
} from 'lucide-react';
import { GestaoMaintenance, INITIAL_MAINTENANCES, getStoredData, saveStoredData } from '@/lib/gestaoData';

const COLUMNS: { key: GestaoMaintenance['status']; label: string; color: string }[] = [
  { key: 'ABERTO', label: '1. Novos Abertos', color: 'border-t-purple-500' },
  { key: 'EM_ANALISE', label: '2. Em Análise / Orçamento', color: 'border-t-amber-500' },
  { key: 'EM_ANDAMENTO', label: '3. Em Andamento', color: 'border-t-blue-500' },
  { key: 'CONCLUIDO', label: '4. Concluídos', color: 'border-t-emerald-500' }
];

export default function MaintenanceAdminPage() {
  const [maintenances, setMaintenances] = useState<GestaoMaintenance[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<GestaoMaintenance | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New ticket state
  const [newTitle, setNewTitle] = useState('');
  const [newUnit, setNewUnit] = useState('Sala 101 - Paulista Corporate');
  const [newRequestedBy, setNewRequestedBy] = useState('TechSolutions Brasil Ltda');
  const [newCategory, setNewCategory] = useState<'ELETRICA' | 'HIDRAULICA' | 'ESTRUTURAL' | 'PINTURA' | 'OUTROS'>('HIDRAULICA');
  const [newUrgency, setNewUrgency] = useState<'BAIXA' | 'MEDIA' | 'ALTA' | 'EMERGENCIA'>('ALTA');
  const [newDescription, setNewDescription] = useState('');
  const [newCost, setNewCost] = useState(300);

  useEffect(() => {
    setMaintenances(getStoredData('maintenances', INITIAL_MAINTENANCES));
  }, []);

  const handleMoveStatus = (id: string, nextStatus: GestaoMaintenance['status']) => {
    const updated = maintenances.map(m => m.id === id ? { ...m, status: nextStatus } : m);
    setMaintenances(updated);
    saveStoredData('maintenances', updated);
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: nextStatus });
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newTicket: GestaoMaintenance = {
      id: `mnt-${Date.now()}`,
      title: newTitle,
      unitName: newUnit,
      requestedBy: newRequestedBy,
      requestedByRole: 'TENANT',
      category: newCategory,
      urgency: newUrgency,
      status: 'ABERTO',
      estimatedCost: Number(newCost),
      description: newDescription,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      photos: []
    };

    const updated = [newTicket, ...maintenances];
    setMaintenances(updated);
    saveStoredData('maintenances', updated);
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[90vh] flex flex-col">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Manutenções & Chamados (Kanban)</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Gestão visual de reparos em prédios e unidades com fotos, orçamentos e aprovação de proprietários.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Abrir Novo Chamado
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {COLUMNS.map(col => {
          const colItems = maintenances.filter(m => m.status === col.key);
          return (
            <div key={col.key} className={`bg-surface border border-border rounded-2xl p-4 flex flex-col space-y-3 border-t-4 ${col.color}`}>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="font-bold text-xs text-text-primary">{col.label}</span>
                <span className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center text-xs font-black text-text-secondary">
                  {colItems.length}
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 max-h-[calc(100vh-320px)] pr-1">
                {colItems.length === 0 ? (
                  <div className="text-center py-10 text-xs text-text-secondary/60">
                    Nenhum chamado nesta etapa
                  </div>
                ) : (
                  colItems.map(ticket => (
                    <div 
                      key={ticket.id}
                      className="p-4 rounded-xl bg-white border border-border shadow-sm hover:border-brand-lime transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          ticket.urgency === 'EMERGENCIA' ? 'bg-red-100 text-red-700' :
                          ticket.urgency === 'ALTA' ? 'bg-orange-100 text-orange-700' :
                          ticket.urgency === 'MEDIA' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.urgency}
                        </span>
                        <span className="text-[10px] font-bold text-text-secondary">
                          {ticket.category}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-text-primary leading-tight line-clamp-2">
                          {ticket.title}
                        </h4>
                        <p className="text-[11px] text-text-secondary mt-1">
                          {ticket.unitName}
                        </p>
                      </div>

                      {ticket.photos.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-brand-lime font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{ticket.photos.length} foto(s) anexada(s)</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                        <span className="font-bold text-text-primary">
                          {ticket.estimatedCost ? `R$ ${ticket.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sem custo'}
                        </span>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-xs font-bold text-brand-lime hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Detalhes
                        </button>
                      </div>

                      {/* Move controls */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                        {col.key !== 'ABERTO' ? (
                          <button
                            onClick={() => {
                              const order: GestaoMaintenance['status'][] = ['ABERTO', 'EM_ANALISE', 'EM_ANDAMENTO', 'CONCLUIDO'];
                              const currentIndex = order.indexOf(col.key);
                              handleMoveStatus(ticket.id, order[currentIndex - 1]);
                            }}
                            className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover font-bold text-text-secondary flex items-center gap-1"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" /> Voltar
                          </button>
                        ) : <div />}

                        {col.key !== 'CONCLUIDO' && (
                          <button
                            onClick={() => {
                              const order: GestaoMaintenance['status'][] = ['ABERTO', 'EM_ANALISE', 'EM_ANDAMENTO', 'CONCLUIDO'];
                              const currentIndex = order.indexOf(col.key);
                              handleMoveStatus(ticket.id, order[currentIndex + 1]);
                            }}
                            className="px-2 py-0.5 rounded bg-brand-lime/10 text-brand-lime hover:bg-brand-lime/20 font-bold flex items-center gap-1"
                          >
                            Avançar <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-lime">
                  Chamado #{selectedTicket.id}
                </span>
                <h3 className="text-base font-black text-text-primary mt-0.5">{selectedTicket.title}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Unidade:</span>
                  <span className="font-bold text-text-primary">{selectedTicket.unitName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Solicitante:</span>
                  <span className="font-bold text-text-primary">{selectedTicket.requestedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Orçamento Estimado:</span>
                  <span className="font-bold text-brand-lime">
                    R$ {selectedTicket.estimatedCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-text-secondary block mb-1">Descrição do Problema:</span>
                <p className="p-3 rounded-xl bg-surface border border-border text-text-primary leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.photos.length > 0 && (
                <div>
                  <span className="font-bold text-text-secondary block mb-1">Fotos do Local:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTicket.photos.map((url, i) => (
                      <img key={i} src={url} alt="Foto da manutenção" className="w-full h-32 object-cover rounded-xl border border-border" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Abrir Chamado de Manutenção</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Título do Chamado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vazamento no encanamento do banheiro"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs font-bold text-text-secondary mb-1">Solicitante</label>
                  <input
                    type="text"
                    value={newRequestedBy}
                    onChange={(e) => setNewRequestedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="HIDRAULICA">Hidráulica</option>
                    <option value="ELETRICA">Elétrica</option>
                    <option value="ESTRUTURAL">Estrutural</option>
                    <option value="PINTURA">Pintura</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Urgência</label>
                  <select
                    value={newUrgency}
                    onChange={(e: any) => setNewUrgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="EMERGENCIA">Emergência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Orçamento (R$)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explique o defeito e instruções para o técnico..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md"
                >
                  Criar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
