'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  Building2, 
  CheckCircle2, 
  Eye, 
  Clock, 
  Plus, 
  X,
  UserCheck
} from 'lucide-react';
import { GestaoAnnouncement, INITIAL_ANNOUNCEMENTS, getStoredData, saveStoredData } from '@/lib/gestaoData';

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<GestaoAnnouncement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<GestaoAnnouncement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newScope, setNewScope] = useState('Todos os Prédios');
  const [newTargetRole, setNewTargetRole] = useState<'TODOS' | 'PROPRIETARIO' | 'INQUILINO'>('TODOS');

  useEffect(() => {
    setAnnouncements(getStoredData('announcements', INITIAL_ANNOUNCEMENTS));
  }, []);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newAnn: GestaoAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      content: newContent,
      unitScope: newScope,
      targetRole: newTargetRole,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      totalTargetUsers: 18,
      readBy: []
    };

    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    saveStoredData('announcements', updated);
    setIsModalOpen(false);
    setNewTitle('');
    setNewContent('');
    alert('Comunicado publicado no mural com sucesso!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Mural de Comunicados</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Envio de avisos gerais e prediais com contagem e lista nominal de confirmação de leitura.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Comunicado
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => {
          const readCount = ann.readBy.length;
          const percentage = ann.totalTargetUsers > 0 ? Math.round((readCount / ann.totalTargetUsers) * 100) : 0;

          return (
            <div key={ann.id} className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4 hover:border-brand-lime transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand-lime/10 text-brand-lime">
                    {ann.unitScope}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-surface border border-border text-text-secondary">
                    Público: {ann.targetRole}
                  </span>
                </div>
                <div className="text-xs text-text-secondary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Publicado em {ann.createdAt}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-text-primary">{ann.title}</h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              {/* Read Receipts Meter and Nominal List */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 max-w-md">
                  <div className="flex justify-between text-xs font-bold text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-brand-lime" />
                      Confirmação de Leitura:
                    </span>
                    <span>{readCount} de {ann.totalTargetUsers} leram ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full bg-brand-lime rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary hover:border-brand-lime flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-brand-lime" /> Ver Quem Leu ({readCount})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Lista Nominal de Quem Leu */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-lime">
                  Confirmações de Leitura
                </span>
                <h3 className="text-sm font-black text-text-primary mt-0.5 line-clamp-1">{selectedAnnouncement.title}</h3>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedAnnouncement.readBy.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-secondary">
                  Nenhum usuário confirmou a leitura até o momento.
                </div>
              ) : (
                selectedAnnouncement.readBy.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-text-primary">{r.userName}</span>
                    </div>
                    <span className="text-[11px] text-text-secondary">{r.readAt}</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Comunicado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Publicar Comunicado</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Título do Comunicado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Limpeza das caixas d'água neste fim de semana"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Âmbito / Prédio</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="Todos os Prédios">Todos os Prédios</option>
                    <option value="Edifício Paulista Corporate">Edifício Paulista Corporate</option>
                    <option value="Residencial Faria Lima Prime">Residencial Faria Lima Prime</option>
                    <option value="Edifício Pinheiros Hub">Edifício Pinheiros Hub</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Destinatários</label>
                  <select
                    value={newTargetRole}
                    onChange={(e: any) => setNewTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="TODOS">Todos (Proprietários + Inquilinos)</option>
                    <option value="INQUILINO">Apenas Inquilinos</option>
                    <option value="PROPRIETARIO">Apenas Proprietários</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Mensagem / Conteúdo</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Digite as instruções ou comunicado..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Publicar no Mural
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
