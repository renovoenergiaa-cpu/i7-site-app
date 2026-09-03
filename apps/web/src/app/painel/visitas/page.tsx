'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  MessageSquare, 
  MapPin, 
  User, 
  Phone, 
  X, 
  Check, 
  Send,
  AlertCircle,
  ExternalLink,
  Building2,
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';
import { 
  ScheduledVisit, 
  INITIAL_VISITS, 
  RentalProposal, 
  INITIAL_PROPOSALS, 
  BuildingUnit, 
  INITIAL_UNITS, 
  getStoredData, 
  saveStoredData, 
  logAuditEvent 
} from '@/lib/gestaoData';

export default function PainelVisitasPage() {
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'RESCHEDULED'>('ALL');

  // Modal para Propor Outra Data / Horário
  const [reschedulingVisit, setReschedulingVisit] = useState<ScheduledVisit | null>(null);
  const [newProposedDate, setNewProposedDate] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Modal para Fechar Aluguel Digital (Etapa 1)
  const [closingVisit, setClosingVisit] = useState<ScheduledVisit | null>(null);
  const [createdProposal, setCreatedProposal] = useState<RentalProposal | null>(null);

  useEffect(() => {
    setVisits(getStoredData<ScheduledVisit[]>('scheduled_visits', INITIAL_VISITS));
  }, []);

  const pendingVisitsCount = visits.filter(v => v.status === 'PENDENTE_CONFIRMACAO').length;

  // 1. Confirmar Visita
  const handleConfirmVisit = (visit: ScheduledVisit) => {
    const updated = visits.map(v => {
      if (v.id === visit.id) {
        return {
          ...v,
          status: 'CONFIRMADA' as const
        };
      }
      return v;
    });

    setVisits(updated);
    saveStoredData('scheduled_visits', updated);

    logAuditEvent(
      'VISITA_CONFIRMADA',
      'Agendamento de Visitas',
      `Visita confirmada para o imóvel "${visit.propertyTitle}" com o cliente ${visit.clientName} (${visit.clientPhone}) em ${visit.scheduledDate.replace('T', ' às ')}`,
      visit.clientEmail
    );
  };

  // 2. Propor Outra Data ou Horário
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingVisit || !newProposedDate) return;

    const updated = visits.map(v => {
      if (v.id === reschedulingVisit.id) {
        return {
          ...v,
          status: 'REAGENDAMENTO_SOLICITADO' as const,
          proposedDate: newProposedDate,
          adminNotes: adminNote || 'Novo horário sugerido pela equipe da i7 Imobiliária.'
        };
      }
      return v;
    });

    setVisits(updated);
    saveStoredData('scheduled_visits', updated);

    logAuditEvent(
      'VISITA_REAGENDAMENTO_PROPOSTO',
      'Agendamento de Visitas',
      `Novo horário proposto para o cliente ${reschedulingVisit.clientName}: de ${reschedulingVisit.scheduledDate.replace('T', ' às ')} para ${newProposedDate.replace('T', ' às ')}`,
      reschedulingVisit.clientEmail
    );

    // Abre WhatsApp automaticamente com a proposta de reagendamento pré-formatada
    const phoneDigits = reschedulingVisit.clientPhone.replace(/\D/g, '');
    const cleanPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
    const message = `Olá ${reschedulingVisit.clientName}! Sou da equipe da i7 Imobiliária sobre a sua solicitação de visita ao imóvel "${reschedulingVisit.propertyTitle}". Verificamos nossa agenda e gostaríamos de propor o dia ${newProposedDate.replace('T', ' às ')}. Este novo horário seria bom para você?`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');

    setReschedulingVisit(null);
    setNewProposedDate('');
    setAdminNote('');
  };

  // 3. Monta o link do WhatsApp para conversa rápida
  const getWhatsAppLink = (visit: ScheduledVisit) => {
    const phoneDigits = visit.clientPhone.replace(/\D/g, '');
    const cleanPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
    const dateFormatted = visit.scheduledDate ? visit.scheduledDate.replace('T', ' às ') : 'horário agendado';
    
    let text = `Olá ${visit.clientName}! Sou da equipe de atendimento da i7 Imobiliária sobre a sua visita ao imóvel "${visit.propertyTitle}" agendada para ${dateFormatted}.`;
    if (visit.status === 'CONFIRMADA') {
      text += ` Passando para confirmar que nosso corretor especialista já está escalado para te receber no local!`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // 4. Iniciar Fechamento Digital (Etapa 1: Visita -> Proposta)
  const handleInitiateClosing = (visit: ScheduledVisit) => {
    const units = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    const matchedUnit = units.find(u => u.id === visit.propertyId || visit.propertyTitle.includes(u.buildingName)) || units[0];

    const proposals = getStoredData<RentalProposal[]>('proposals', INITIAL_PROPOSALS);
    const existing = proposals.find(p => p.visitId === visit.id);

    if (existing) {
      setCreatedProposal(existing);
      setClosingVisit(visit);
      return;
    }

    const code = `PROP-2026-${String(proposals.length + 1).padStart(3, '0')}`;
    const newProposal: RentalProposal = {
      id: `prop-lease-${Date.now()}`,
      code,
      visitId: visit.id,
      propertyId: matchedUnit?.id || visit.propertyId,
      propertyTitle: visit.propertyTitle,
      propertyAddress: visit.propertyAddress,
      unitName: `${matchedUnit?.unitNumber || 'Unidade'} - ${matchedUnit?.buildingName || 'Residencial i7'}`,
      rentValue: matchedUnit?.rentValue || 3500,
      condoValue: matchedUnit?.condoValue || 500,
      iptuValue: matchedUnit?.iptuValue || 150,
      totalMonthly: (matchedUnit?.rentValue || 3500) + (matchedUnit?.condoValue || 500) + (matchedUnit?.iptuValue || 150),
      clientName: visit.clientName,
      clientEmail: visit.clientEmail,
      clientPhone: visit.clientPhone,
      guaranteeType: 'FIANCA_DIGITAL',
      documents: [],
      status: 'AGUARDANDO_DOCUMENTOS',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newProposal, ...proposals];
    saveStoredData('proposals', updated);
    setCreatedProposal(newProposal);
    setClosingVisit(visit);

    logAuditEvent(
      'PROPOSTA_INICIADA_POS_VISITA',
      'Agendamento de Visitas',
      `Proposta de locação digital "${code}" iniciada para o cliente ${visit.clientName} referente ao imóvel "${visit.propertyTitle}".`,
      visit.clientEmail
    );
  };

  const filteredVisits = visits.filter(v => {
    const matchesSearch = 
      v.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clientPhone.includes(searchTerm);

    let matchesTab = true;
    if (activeTab === 'PENDING') matchesTab = v.status === 'PENDENTE_CONFIRMACAO';
    if (activeTab === 'CONFIRMED') matchesTab = v.status === 'CONFIRMADA';
    if (activeTab === 'RESCHEDULED') matchesTab = v.status === 'REAGENDAMENTO_SOLICITADO';

    return matchesSearch && matchesTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Agendamento de Visitas Presenciais</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Gestão das solicitações de visita recebidas pelo site, confirmação de horários, reagendamento e contato direto no <strong>WhatsApp</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-secondary">
            Total: <strong className="text-text-primary font-black">{visits.length}</strong>
          </div>
          {pendingVisitsCount > 0 && (
            <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs font-black text-amber-900 flex items-center gap-1.5 animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingVisitsCount} Aguardando Confirmação</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'ALL' ? 'bg-brand-lime text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            Todas ({visits.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'PENDING' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>🔔 Aguardando Confirmação</span>
            {pendingVisitsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-900 font-black">
                {pendingVisitsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONFIRMED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'CONFIRMED' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            Confirmadas ({visits.filter(v => v.status === 'CONFIRMADA').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESCHEDULED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'RESCHEDULED' ? 'bg-blue-600 text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            Reagendadas ({visits.filter(v => v.status === 'REAGENDAMENTO_SOLICITADO').length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, imóvel ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
          />
        </div>
      </div>

      {/* Grid de Visitas */}
      {filteredVisits.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-border space-y-3">
          <Calendar className="w-12 h-12 text-text-secondary mx-auto opacity-40" />
          <h3 className="text-base font-bold text-text-primary">Nenhuma visita encontrada</h3>
          <p className="text-xs text-text-secondary">Nenhuma solicitação corresponde ao filtro selecionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVisits.map((visit) => {
            const isPending = visit.status === 'PENDENTE_CONFIRMACAO';
            const isConfirmed = visit.status === 'CONFIRMADA';
            const isRescheduled = visit.status === 'REAGENDAMENTO_SOLICITADO';

            return (
              <div 
                key={visit.id}
                className={`p-6 rounded-2xl bg-white border shadow-sm space-y-4 transition-all ${
                  isPending ? 'border-2 border-amber-400 bg-amber-50/10' : 'border-border'
                }`}
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-lime">
                      Visita Presencial
                    </span>
                    <h3 className="font-extrabold text-base text-text-primary mt-0.5">{visit.propertyTitle}</h3>
                    <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span>{visit.propertyAddress}</span>
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    isConfirmed
                      ? 'bg-emerald-100 text-emerald-700'
                      : isPending
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : isRescheduled
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isPending ? 'AGUARDANDO CONFIRMAÇÃO' : isConfirmed ? 'CONFIRMADA' : isRescheduled ? 'NOVA DATA PROPOSTA' : visit.status}
                  </span>
                </div>

                {/* Dados do Cliente e Horário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                    <span className="text-text-secondary font-bold block text-[10px] uppercase">Interessado</span>
                    <div className="font-extrabold text-text-primary flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-lime" />
                      <span>{visit.clientName}</span>
                    </div>
                    <div className="text-text-muted flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3 h-3 text-text-muted" />
                      <span>{visit.clientPhone}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                    <span className="text-text-secondary font-bold block text-[10px] uppercase">Data Solicitada</span>
                    <div className="font-black text-text-primary text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-lime" />
                      <span>{visit.scheduledDate.replace('T', ' às ')}</span>
                    </div>
                    <div className="text-text-muted text-[10px]">
                      Solicitada em: {visit.createdAt}
                    </div>
                  </div>
                </div>

                {/* Proposta de nova data se houver */}
                {visit.proposedDate && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-0.5">
                    <strong className="block text-blue-900 font-bold">Nova Data Proposta pelo Administrador:</strong>
                    <div>{visit.proposedDate.replace('T', ' às ')}</div>
                    {visit.adminNotes && <div className="text-[11px] text-blue-800 italic mt-0.5">"{visit.adminNotes}"</div>}
                  </div>
                )}

                {/* Observações do Cliente se houver */}
                {visit.adminNotes && !visit.proposedDate && (
                  <div className="p-2.5 rounded-xl bg-surface border border-border text-[11px] text-text-secondary">
                    <strong className="text-text-primary block mb-0.5">Observação do Cliente:</strong>
                    {visit.adminNotes}
                  </div>
                )}

                {/* BOTÕES DE AÇÃO DO ADMINISTRADOR */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {/* Botão de WhatsApp */}
                  <a
                    href={getWhatsAppLink(visit)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow flex items-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Fechar Aluguel Digital - ETAPA 1 DA LOCAÇÃO */}
                  <button
                    type="button"
                    onClick={() => handleInitiateClosing(visit)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-lime-600 to-brand-lime hover:brightness-105 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Enviar proposta digital para fechar o aluguel deste cliente"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>🚀 Fechar Aluguel Digital</span>
                  </button>

                  {/* Confirmar Visita */}
                  {!isConfirmed && (
                    <button
                      type="button"
                      onClick={() => handleConfirmVisit(visit)}
                      className="px-4 py-2.5 rounded-xl bg-surface border border-brand-lime text-brand-lime hover:bg-brand-lime hover:text-white text-xs font-black shadow flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmar Visita</span>
                    </button>
                  )}

                  {/* Propor Outro Horário */}
                  <button
                    type="button"
                    onClick={() => {
                      setReschedulingVisit(visit);
                      setNewProposedDate(visit.scheduledDate);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-brand-lime" />
                    <span>Propor Outro Horário</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Fechar Aluguel Digital (Etapa 1: Visita -> Proposta) */}
      {closingVisit && createdProposal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-border max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-brand-lime bg-lime-50 px-2 py-0.5 rounded border border-lime-200">
                    {createdProposal.code}
                  </span>
                  <span className="text-xs font-black uppercase text-text-secondary">Etapa 1: Disparo da Proposta</span>
                </div>
                <h3 className="text-lg font-black text-text-primary mt-1">Fechar Aluguel de Forma Digital</h3>
              </div>
              <button onClick={() => setClosingVisit(null)} className="p-1 rounded-xl text-text-secondary hover:bg-surface cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-bold">Cliente Interessado:</span>
                <span className="font-extrabold text-text-primary">{closingVisit.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-bold">WhatsApp:</span>
                <span className="font-bold text-text-primary">{closingVisit.clientPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-bold">Imóvel:</span>
                <span className="font-bold text-text-primary text-right">{createdProposal.unitName}</span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between font-black text-sm">
                <span className="text-text-primary">Pacote Mensal Previsto:</span>
                <span className="text-brand-lime">R$ {createdProposal.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-lime-50/60 border border-brand-lime/30 text-xs space-y-2">
              <strong className="text-lime-950 font-black block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-lime" />
                <span>Link da Proposta Digital Gerado:</span>
              </strong>
              <div className="p-2.5 rounded-xl bg-white border border-brand-lime/30 font-mono text-[11px] text-text-primary break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/proposta/${createdProposal.id}` : `/proposta/${createdProposal.id}`}
              </div>
              <p className="text-[11px] text-lime-900 leading-relaxed">
                O cliente receberá este link no WhatsApp para conferir os valores, enviar documentos (RG/CNH e renda) e escolher a garantia (Fiança Digital sem fiador ou Caução).
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border">
              <button
                type="button"
                onClick={() => setClosingVisit(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface text-text-secondary text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>

              <a
                href={`https://wa.me/55${closingVisit.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Olá, ${closingVisit.clientName}! Aqui é da i7 Imobiliária.\n\nQue ótimo que você gostou da visita ao imóvel "${closingVisit.propertyTitle}"!\n\nPara reservá-lo e iniciarmos o contrato de aluguel de forma 100% digital (sem cartório e sem complicação), acesse o link seguro da sua proposta:\n\n${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/proposta/${createdProposal.id}\n\nLá você confere os valores, escolhe a garantia (temos Fiança Digital sem fiador) e anexa seus documentos pelo próprio celular em 2 minutos!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Disparar Proposta no WhatsApp do Cliente</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Propor Outra Data ou Horário */}
      {reschedulingVisit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-lime">Reagendamento de Visita</span>
                <h3 className="text-lg font-black text-text-primary mt-0.5">Propor Nova Data ou Horário</h3>
              </div>
              <button onClick={() => setReschedulingVisit(null)} className="p-1 rounded-xl text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1">
                <div><strong>Imóvel:</strong> {reschedulingVisit.propertyTitle}</div>
                <div><strong>Cliente:</strong> {reschedulingVisit.clientName} ({reschedulingVisit.clientPhone})</div>
                <div><strong>Horário Solicitado Anteriormente:</strong> {reschedulingVisit.scheduledDate.replace('T', ' às ')}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Nova Data e Horário Sugeridos *</label>
                <input 
                  type="datetime-local"
                  value={newProposedDate}
                  onChange={(e) => setNewProposedDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface border border-border text-sm font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Mensagem / Justificativa para o Cliente</label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ex: Tivemos um compromisso prévio neste horário, seria possível às 15:30?"
                  className="w-full p-3 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime resize-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReschedulingVisit(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface text-text-secondary text-xs font-bold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Salvar & Enviar Proposta no WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
