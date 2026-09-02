'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, FileText, CreditCard, Wrench, Building2, CheckCircle2, QrCode, ArrowDownToLine, Users, CheckSquare, Search, Bell } from 'lucide-react';
import { getCurrentSession, UserSession } from '@/lib/auth';

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>('contracts');
  const [paidInvoices, setPaidInvoices] = useState<Record<string, boolean>>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const fetchAnnouncements = async () => {
    try {
      const s = getCurrentSession();
      const token = s?.accessToken;
      const res = await fetch('http://localhost:4000/api/announcements', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const s = getCurrentSession();
      const token = s?.accessToken;
      if (!s?.user?.id) return;
      await fetch(`http://localhost:4000/api/announcements/${id}/read`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId: s.user.id })
      });
      fetchAnnouncements();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const s = getCurrentSession();
    setSession(s);
    if (s?.user?.role === 'OWNER') {
      setActiveTab('statements');
    } else {
      setActiveTab('contracts');
    }
    fetchAnnouncements();
  }, []);

  const handlePayInvoice = (id: string) => {
    setPaidInvoices(prev => ({ ...prev, [id]: true }));
  };

  const userName = session?.user?.name || 'Visitante';
  const userEmail = session?.user?.email || '';
  const isOwner = session?.user?.role === 'OWNER';
  const userRoleStr = isOwner ? 'Proprietário i7' : 'Locatário i7 Verificado';

  const getUserInitials = (name: string) => {
    if (!name) return 'i7';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-text-secondary font-medium">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dashboard Top Header Dynamic */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center font-bold text-2xl text-brand-lime">
            {getUserInitials(userName)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary">{userName}</h1>
            <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${isOwner ? 'bg-brand-lime/20 text-brand-lime' : 'bg-brand-lime/10 text-brand-lime'}`}>
                {userRoleStr}
              </span>
              <span>• {userEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOwner ? (
            <Link href="/vender" className="px-5 py-3 rounded-xl text-sm font-bold bg-brand-lime text-white hover:bg-brand-lime-hover transition-colors flex items-center gap-2 shadow-md">
              <Building2 className="w-4 h-4" /> Anunciar Novo Imóvel
            </Link>
          ) : (
            <Link href="/imoveis" className="px-5 py-3 rounded-xl text-sm font-bold bg-surface-hover border border-border text-text-primary hover:border-brand-lime flex items-center gap-2 transition-colors">
              <Search className="w-4 h-4 text-brand-lime" /> Buscar Novo Imóvel
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-3 text-sm font-semibold">
        {!isOwner && (
          <>
            <button 
              onClick={() => setActiveTab('contracts')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'contracts' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText className="w-4 h-4" /> Meus Contratos
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'payments' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Boletos & Pagamentos
            </button>
            <button 
              onClick={() => setActiveTab('visits')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'visits' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Calendar className="w-4 h-4" /> Minhas Visitas
            </button>
            <button 
              onClick={() => setActiveTab('maintenance')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'maintenance' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Wrench className="w-4 h-4" /> Chamados
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'announcements' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Bell className="w-4 h-4" /> Comunicados
            </button>
          </>
        )}

        {isOwner && (
          <>
            <button 
              onClick={() => setActiveTab('statements')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'statements' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" /> Extrato de Repasses
            </button>
            <button 
              onClick={() => setActiveTab('my_properties')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'my_properties' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Building2 className="w-4 h-4" /> Meus Imóveis
            </button>
            <button 
              onClick={() => setActiveTab('owner_visits')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'owner_visits' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Users className="w-4 h-4" /> Visitas Agendadas
            </button>
            <button 
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'approvals' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <CheckSquare className="w-4 h-4" /> Aprovações
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                activeTab === 'announcements' ? 'bg-brand-lime text-white border-brand-lime shadow-md' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Bell className="w-4 h-4" /> Comunicados
            </button>
          </>
        )}
      </div>

      {/* ===================== TAB CONTENTS FOR TENANTS ===================== */}
      {activeTab === 'contracts' && !isOwner && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-lime text-white">Contrato Ativo</span>
                <span className="text-[11px] font-mono text-text-muted">ID: #CT-2026-8812</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary">Studio High-Tech em Pinheiros com Varanda</h3>
              <p className="text-sm text-text-secondary">Rua dos Pinheiros, 850 — Apto 1204, Pinheiros, São Paulo</p>
              <div className="text-xs font-semibold text-text-muted pt-2 bg-surface-hover inline-block px-3 py-1.5 rounded-lg mt-2">Vigência: 01/03/2026 a 28/02/2027 • Valor Mensal: R$ 4.934,00</div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button className="px-5 py-2.5 rounded-xl font-bold bg-surface-hover border border-border text-xs text-text-primary hover:border-brand-lime hover:text-brand-lime transition-colors">
                Baixar Contrato Assinado (PDF)
              </button>
              <button onClick={() => setActiveTab('maintenance')} className="px-5 py-2.5 rounded-xl font-bold bg-brand-lime text-white text-xs hover:bg-brand-lime-hover transition-colors shadow-md">
                Abrir Chamado de Reparo
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && !isOwner && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-lime" /> Boletos de Aluguel
            </h3>

            <div className="divide-y divide-border">
              
              {/* Invoice Item 1 */}
              <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-text-primary">Mensalidade Agosto/2026</div>
                  <div className="text-xs font-medium text-text-secondary mt-1">Vencimento: 10/08/2026 • Valor: <span className="font-bold text-brand-lime">R$ 4.934,00</span></div>
                </div>

                {paidInvoices['inv-1'] ? (
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-600 border border-green-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Pago via PIX
                  </span>
                ) : (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handlePayInvoice('inv-1')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-lime text-white flex items-center gap-2 hover:bg-brand-lime-hover transition-colors shadow-md"
                    >
                      <QrCode className="w-4 h-4" /> Copiar Código PIX
                    </button>
                  </div>
                )}
              </div>

              {/* Invoice Item 2 */}
              <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-text-primary">Mensalidade Julho/2026</div>
                  <div className="text-xs font-medium text-text-muted mt-1">Pago em: 08/07/2026 • Valor: R$ 4.934,00</div>
                </div>
                <span className="px-4 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-600 border border-green-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Pago
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'visits' && !isOwner && (
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-text-primary">Visitas Agendadas</h3>
          <div className="p-4 rounded-xl bg-surface-hover border border-border flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-text-primary">Apartamento de Luxo 3 Dorms no Itaim Bibi</div>
              <div className="text-xs text-text-secondary mt-1">Data: 02/08/2026 às 14:30 • Tipo: Presencial</div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
              Confirmada
            </span>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && !isOwner && (
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-primary">Chamados de Manutenção</h3>
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-lime text-white shadow-md hover:bg-brand-lime-hover transition-colors">
              + Abrir Chamado
            </button>
          </div>
          <div className="p-4 rounded-xl bg-surface-hover border border-border flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-text-primary">Manutenção de Ar-Condicionado Split</div>
              <div className="text-xs text-text-secondary mt-1">Aberto em 20/07/2026 • Em Atendimento pela Equipe i7</div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600 border border-yellow-200">
              Em Andamento
            </span>
          </div>
        </div>
      )}


      {/* ===================== TAB CONTENTS FOR OWNERS ===================== */}
      {activeTab === 'statements' && isOwner && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-brand-lime text-white shadow-lg space-y-2">
              <div className="text-sm font-bold opacity-90 uppercase tracking-wider">A Receber este mês</div>
              <div className="text-3xl font-black">R$ 14.850,00</div>
              <div className="text-xs font-medium opacity-80 pt-2 border-t border-white/20">Próximo repasse: 12/08/2026</div>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-2">
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Recebido no ano</div>
              <div className="text-3xl font-black text-text-primary">R$ 89.100,00</div>
              <div className="text-xs font-medium text-brand-lime pt-2 border-t border-border mt-2">+12% vs ano anterior</div>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-2 flex flex-col justify-center">
              <button className="w-full py-3 rounded-xl font-bold bg-surface-hover border border-border text-text-primary hover:border-brand-lime hover:text-brand-lime transition-all text-sm">
                Baixar Informe de Rendimentos (IR)
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border shadow-sm mt-6">
            <h3 className="text-base font-bold text-text-primary border-b border-border pb-4 mb-4">Últimos Repasses</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-surface-hover rounded-xl border border-border">
                <div>
                  <div className="font-bold text-text-primary text-sm">Repasse - Julho/2026</div>
                  <div className="text-xs text-text-secondary mt-1">Referente a 3 contratos ativos</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-brand-lime">R$ 14.850,00</div>
                  <div className="text-xs text-text-muted mt-0.5">Transferido em 12/07/2026</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-surface-hover rounded-xl border border-border">
                <div>
                  <div className="font-bold text-text-primary text-sm">Repasse - Junho/2026</div>
                  <div className="text-xs text-text-secondary mt-1">Referente a 3 contratos ativos</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-brand-lime">R$ 14.850,00</div>
                  <div className="text-xs text-text-muted mt-0.5">Transferido em 12/06/2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'my_properties' && isOwner && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary">Meus Imóveis na i7</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property 1 */}
            <div className="rounded-2xl bg-white border border-border shadow-sm flex overflow-hidden">
              <div className="w-1/3 bg-surface-hover relative">
                <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400" className="w-full h-full object-cover" alt="Imóvel" />
              </div>
              <div className="p-5 w-2/3 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-lime/10 text-brand-lime border border-brand-lime/20">Alugado</span>
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-sm">Apto 3 Dorms - Itaim Bibi</h4>
                  <p className="text-xs text-text-secondary mt-1">Rua Jesuíno Arruda, 100</p>
                </div>
                <div className="text-xs font-bold text-text-primary pt-2 border-t border-border">
                  Repasse mensal: <span className="text-brand-lime">R$ 6.500,00</span>
                </div>
              </div>
            </div>

            {/* Property 2 */}
            <div className="rounded-2xl bg-white border border-border shadow-sm flex overflow-hidden">
              <div className="w-1/3 bg-surface-hover relative">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400" className="w-full h-full object-cover grayscale opacity-80" alt="Imóvel" />
              </div>
              <div className="p-5 w-2/3 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600 border border-yellow-200">Disponível / Anunciado</span>
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-sm">Casa Térrea - Alto de Pinheiros</h4>
                  <p className="text-xs text-text-secondary mt-1">Praça Panamericana, 50</p>
                </div>
                <div className="text-xs font-bold text-text-primary pt-2 border-t border-border">
                  Valor Anunciado: <span className="text-brand-lime">R$ 8.350,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'owner_visits' && isOwner && (
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-text-primary">Visitas Agendadas nos seus Imóveis</h3>
          <p className="text-sm text-text-secondary pb-2 border-b border-border">
            Corretores da i7 estão com chaves/senhas e acompanharão os clientes. Você não precisa fazer nada.
          </p>
          <div className="p-4 rounded-xl bg-surface-hover border border-border flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-text-primary">Casa Térrea - Alto de Pinheiros</div>
              <div className="text-xs text-text-secondary mt-1">Data: 04/08/2026 às 10:00 • Corretor Parceiro: Marcos T.</div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
              Confirmada
            </span>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && isOwner && (
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-text-primary">Aprovações Pendentes</h3>
          <div className="p-5 rounded-xl bg-surface-hover border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-text-primary">Aprovar Orçamento: Troca de Resistência (Chuveiro)</div>
              <div className="text-xs text-text-secondary mt-1">Imóvel: Apto 3 Dorms - Itaim Bibi</div>
              <div className="text-sm font-bold text-red-600 mt-2">Valor: R$ 150,00 (Será descontado do próximo repasse)</div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-border text-text-primary hover:bg-gray-50 transition-colors">
                Recusar
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-lime text-white shadow-md hover:bg-brand-lime-hover transition-colors">
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-text-primary">Mural de Comunicados</h3>
          {announcements.filter(a => a.target === 'ALL' || a.target === session?.user?.role).length === 0 ? (
            <div className="p-10 text-center rounded-2xl border-2 border-dashed border-border bg-surface-hover text-text-muted">
              Nenhum comunicado no momento.
            </div>
          ) : (
            <div className="space-y-4">
              {announcements
                .filter(a => a.target === 'ALL' || a.target === session?.user?.role)
                .map(announcement => (
                  <div key={announcement.id} className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                          {announcement.target === 'ALL' ? 'Geral' : announcement.target === 'OWNER' ? 'Proprietários' : 'Inquilinos'}
                        </span>
                        <span className="text-xs text-text-muted font-mono">{new Date(announcement.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-base">{announcement.title}</h4>
                      <p className="text-sm text-text-secondary mt-2 whitespace-pre-line">{announcement.content}</p>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-end">
                      <button 
                        onClick={() => handleMarkAsRead(announcement.id)}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-surface-hover border border-border text-text-primary hover:border-brand-lime hover:text-brand-lime transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Marcar como Lido
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
