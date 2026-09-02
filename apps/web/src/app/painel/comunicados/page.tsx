'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, Building2, CheckCircle2, RefreshCw } from 'lucide-react';

interface AnnouncementModel {
  id: string;
  title: string;
  content: string;
  target: string;
  createdAt: string;
  _count?: { reads: number };
}

export default function AnnouncementsAdminPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('ALL');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  
  const [announcements, setAnnouncements] = useState<AnnouncementModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { getCurrentSession } = await import('@/lib/auth');
      const s = getCurrentSession();
      const token = s?.accessToken;
      const res = await fetch('http://localhost:4000/api/announcements', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const { getCurrentSession } = await import('@/lib/auth');
      const s = getCurrentSession();
      const token = s?.accessToken;
      const res = await fetch('http://localhost:4000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, content, target })
      });

      if (res.ok) {
        setStatus('success');
        setTitle('');
        setContent('');
        fetchAnnouncements();
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Mural de Comunicados</h1>
        <p className="text-sm text-text-secondary mt-1">Envie avisos em massa para inquilinos e proprietários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Envio */}
        <div className="lg:col-span-2 p-8 rounded-2xl bg-white border border-border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Público Alvo</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTarget('ALL')}
                  className={`p-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-colors ${target === 'ALL' ? 'bg-brand-lime/10 border-brand-lime text-brand-lime' : 'bg-surface-hover border-border text-text-secondary'}`}
                >
                  <Users className="w-4 h-4" /> Todos
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('OWNER')}
                  className={`p-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-colors ${target === 'OWNER' ? 'bg-brand-lime/10 border-brand-lime text-brand-lime' : 'bg-surface-hover border-border text-text-secondary'}`}
                >
                  <Building2 className="w-4 h-4" /> Proprietários
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('TENANT')}
                  className={`p-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-colors ${target === 'TENANT' ? 'bg-brand-lime/10 border-brand-lime text-brand-lime' : 'bg-surface-hover border-border text-text-secondary'}`}
                >
                  <Users className="w-4 h-4" /> Inquilinos
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Título Principal</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Atualização do Regulamento do Condomínio"
                className="w-full px-4 py-3 rounded-xl bg-surface-hover border border-border text-sm text-text-primary focus:outline-none focus:border-brand-lime transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Conteúdo da Mensagem</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Escreva os detalhes do aviso..."
                className="w-full px-4 py-3 rounded-xl bg-surface-hover border border-border text-sm text-text-primary focus:outline-none focus:border-brand-lime transition-colors resize-none"
                required
              />
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              {status === 'success' ? (
                <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Comunicado disparado com sucesso!
                </p>
              ) : (
                <div />
              )}
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold bg-brand-lime text-white hover:bg-brand-lime-hover transition-colors shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Disparar Comunicado
              </button>
            </div>
          </form>
        </div>

        {/* Histórico Recente */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-primary">Enviados Recentemente</h3>
            <button onClick={fetchAnnouncements} className="text-text-muted hover:text-brand-lime">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-sm text-text-muted">Carregando...</p>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum comunicado enviado.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      announcement.target === 'OWNER' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                      announcement.target === 'TENANT' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-brand-lime/10 text-brand-lime border border-brand-lime/20'
                    }`}>
                      {announcement.target === 'ALL' ? 'Todos' : announcement.target === 'OWNER' ? 'Proprietários' : 'Inquilinos'}
                    </span>
                    <span className="text-xs text-text-muted font-mono">
                      {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-text-primary">{announcement.title}</h4>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary pt-2 border-t border-border mt-2">
                    <CheckCircle2 className="w-3 h-3 text-brand-lime" /> {announcement._count?.reads || 0} leituras confirmadas
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
