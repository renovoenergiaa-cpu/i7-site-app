'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPropertyById } from '@/lib/api';
import { PropertyDTO } from '@i7/types';
import { MapPin, Calendar, Send, MessageSquare, ShieldCheck, Heart, Sparkles, Check, ChevronRight, X, User, Lock, Phone } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth';
import { ScheduledVisit, INITIAL_VISITS, getStoredData, saveStoredData, logAuditEvent } from '@/lib/gestaoData';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDTO | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  
  // Modals
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [visitDate, setVisitDate] = useState('2026-09-10T14:30');
  const [proposalAmount, setProposalAmount] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'Corretor i7', text: 'Olá! Sou o corretor responsável por este imóvel. Como posso ajudar você hoje?' }
  ]);
  const [newMessageText, setNewMessageText] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [scheduledVisitData, setScheduledVisitData] = useState<ScheduledVisit | null>(null);

  useEffect(() => {
    const session = getCurrentSession();
    if (session?.user) {
      setClientName(session.user.name);
      setClientPhone(session.user.phone || '');
    }

    if (params.id) {
      fetchPropertyById(params.id as string).then(data => {
        setProperty(data);
        if (data) setProposalAmount(data.rentPrice);
      });
    }
  }, [params.id]);

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-lime border-t-transparent animate-spin mx-auto" />
        <p className="text-text-secondary font-medium">Carregando detalhes do imóvel i7...</p>
      </div>
    );
  }

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !visitDate) {
      alert('Por favor, preencha seu nome, telefone/WhatsApp e o horário desejado.');
      return;
    }

    const session = getCurrentSession();
    const clientEmail = session?.user?.email || 'contato@cliente.com.br';

    const newVisit: ScheduledVisit = {
      id: `vis-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: `${property.street}, ${property.number} - ${property.neighborhood}, ${property.city}`,
      clientName,
      clientEmail,
      clientPhone,
      scheduledDate: visitDate,
      status: 'PENDENTE_CONFIRMACAO',
      adminNotes: clientNotes,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    const currentVisits = getStoredData<ScheduledVisit[]>('scheduled_visits', INITIAL_VISITS);
    saveStoredData('scheduled_visits', [newVisit, ...currentVisits]);

    logAuditEvent(
      'SOLICITACAO_VISITA',
      'Agendamento de Visitas',
      `Nova visita presencial solicitada para "${property.title}" por ${clientName} (${clientPhone}) para ${visitDate.replace('T', ' às ')}`,
      clientEmail
    );

    setScheduledVisitData(newVisit);
    setVisitModalOpen(false);
    setSuccessBanner(`Solicitação de visita presencial enviada com sucesso para nossa equipe! O Administrador i7 foi notificado para confirmação.`);
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setProposalModalOpen(false);
    setSuccessBanner('Proposta de aluguel enviada diretamente ao proprietário! Acompanhe o status no seu painel.');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    setChatMessages([...chatMessages, { sender: 'Você', text: newMessageText }]);
    setNewMessageText('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'Corretor i7', text: 'Recebido! Verifiquei que o imóvel aceita pets e o condomínio possui vaga demarcada.' }]);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl glass-panel border-brand-lime bg-brand-lime/10 text-brand-lime text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 shrink-0" /> 
            <span>{successBanner}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {scheduledVisitData && (
              <a
                href={`https://wa.me/551130904000?text=${encodeURIComponent(
                  `Olá! Gostaria de falar sobre a minha solicitação de visita presencial ao imóvel "${property.title}" agendada para ${scheduledVisitData.scheduledDate.replace('T', ' às ')}. Meu nome é ${scheduledVisitData.clientName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow transition-all shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </a>
            )}
            <button onClick={() => setSuccessBanner(null)} className="p-1 hover:text-text-primary text-text-muted"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-lime uppercase tracking-wider mb-1">
            <span>{property.type}</span> • <span>Atendimento Premium i7</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary">{property.title}</h1>
          <p className="text-sm text-text-secondary mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-lime" /> {property.street}, {property.number} — {property.neighborhood}, {property.city} - {property.state}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 rounded-xl bg-surface-card border border-border hover:border-brand-lime text-text-secondary hover:text-brand-lime transition-all">
            <Heart className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setChatModalOpen(true)}
            className="px-4 py-3 rounded-xl bg-surface-card border border-border hover:border-brand-lime text-sm font-bold text-text-primary flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-brand-lime" /> Conversar no Chat
          </button>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Photo */}
        <div className="md:col-span-2 relative h-96 sm:h-[450px] rounded-2xl overflow-hidden glass-card">
          <img 
            src={property.media[activeMediaIndex]?.url || property.media[0]?.url} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {property.hasVirtualTour && (
            <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-background/80 backdrop-blur-md text-xs font-bold text-brand-lime border border-brand-lime/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Tour Virtual 360° Disponível
            </div>
          )}
        </div>

        {/* Thumbnails */}
        <div className="flex md:flex-col gap-4 overflow-x-auto">
          {property.media.map((item, idx) => (
            <button 
              key={item.id}
              onClick={() => setActiveMediaIndex(idx)}
              className={`relative h-24 md:h-[135px] w-36 md:w-full rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                activeMediaIndex === idx ? 'border-brand-lime shadow-glow-lime' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={item.url} alt="Miniatura" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* TWO COLUMN DETAIL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Specs, Description */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Attributes Grid */}
          <div className="p-6 rounded-2xl glass-card border border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-surface rounded-xl">
              <span className="text-xs text-text-muted">Quartos</span>
              <div className="text-xl font-bold text-text-primary mt-1">{property.bedrooms}</div>
            </div>
            <div className="p-3 bg-surface rounded-xl">
              <span className="text-xs text-text-muted">Banheiros</span>
              <div className="text-xl font-bold text-text-primary mt-1">{property.bathrooms}</div>
            </div>
            <div className="p-3 bg-surface rounded-xl">
              <span className="text-xs text-text-muted">Vagas</span>
              <div className="text-xl font-bold text-text-primary mt-1">{property.parkingSpots}</div>
            </div>
            <div className="p-3 bg-surface rounded-xl">
              <span className="text-xs text-text-muted">Área Útil</span>
              <div className="text-xl font-bold text-text-primary mt-1">{property.areaSqm} m²</div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl glass-card border border-border space-y-3">
            <h3 className="text-lg font-bold text-text-primary">Sobre o imóvel</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{property.description}</p>
          </div>

          {/* Features Checklist */}
          <div className="p-6 rounded-2xl glass-card border border-border space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Diferenciais e Infraestrutura</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-lime" /> Mobiliado: {property.furnished ? 'Sim' : 'Não'}
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-lime" /> Pet Friendly: {property.petFriendly ? 'Sim 🐾' : 'Não'}
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-lime" /> Fechadura Eletrônica
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-lime" /> Portaria 24h
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Action Box */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-2xl glass-panel border border-brand-lime/40 shadow-glow-lime space-y-6 sticky top-28">
            
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total mensal estimado</span>
              <div className="text-3xl font-black text-text-primary mt-1">
                R$ {property.totalMonthly?.toLocaleString('pt-BR')} <span className="text-xs font-normal text-text-secondary">/mês</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 pt-4 border-t border-border/60 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Aluguel</span>
                <span className="text-text-primary font-semibold">R$ {property.rentPrice.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Condomínio</span>
                <span className="text-text-primary font-semibold">R$ {property.condoFee.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>IPTU mensal</span>
                <span className="text-text-primary font-semibold">R$ {property.iptuFee.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Taxa de Serviço i7</span>
                <span className="text-brand-lime font-semibold">R$ {property.serviceFee.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => setVisitModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-brand-lime text-background hover:bg-brand-lime-hover shadow-glow-lime flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="w-5 h-5" /> Agendar Visita
              </button>

              <button 
                onClick={() => setProposalModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-surface-card border border-border hover:border-brand-lime text-text-primary flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4 text-brand-lime" /> Fazer Proposta Online
              </button>
            </div>

            <div className="text-[11px] text-text-muted flex items-center gap-1.5 pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-lime" /> Aluguel sem fiador e com aprovação imediata.
            </div>

          </div>

        </div>

      </div>

      {/* SCHEDULE VISIT MODAL */}
      {visitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-brand-lime/40 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-lime" /> Agendar Visita i7
              </h3>
              <button onClick={() => setVisitModalOpen(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/30 text-xs text-brand-lime font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Visita Presencial Oficial (Acompanhada por Especialista Credenciado)</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Seu Nome Completo *</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Alberto Silva"
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">WhatsApp / Telefone para Confirmação *</label>
                <input 
                  type="text" 
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ex: (15) 99123-4567"
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Data e Horário Desejados *</label>
                <input 
                  type="datetime-local" 
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Observações (Opcional)</label>
                <textarea 
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Alguma dúvida ou preferência de horário?"
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-brand-lime resize-none"
                />
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl font-bold bg-brand-lime text-white hover:bg-brand-lime-hover shadow-md transition-all cursor-pointer">
                Confirmar Solicitação de Visita
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROPOSAL MODAL */}
      {proposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-brand-lime/40 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Send className="w-5 h-5 text-brand-lime" /> Proposta de Aluguel
              </h3>
              <button onClick={() => setProposalModalOpen(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSendProposal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Valor do Aluguel Proposto (R$)</label>
                <input 
                  type="number" 
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(Number(e.target.value))}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary font-bold focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Observações para o Proprietário</label>
                <textarea 
                  rows={3}
                  placeholder="Ex: Gostaria de iniciar o contrato dia 15..."
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl font-bold bg-brand-lime text-white hover:bg-brand-lime-hover shadow-glow-blue">
                Enviar Proposta Oficial
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-lg h-[500px] p-6 rounded-2xl glass-panel border border-border flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-lime" /> Chat i7 — {property.neighborhood}
              </h3>
              <button onClick={() => setChatModalOpen(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'Você' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-xl text-xs ${
                    msg.sender === 'Você' ? 'bg-brand-lime text-background font-medium' : 'bg-surface-card text-text-primary border border-border'
                  }`}>
                    <div className="font-bold mb-0.5">{msg.sender}</div>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-border">
              <input 
                type="text" 
                placeholder="Digite sua dúvida..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 bg-surface-card border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none"
              />
              <button type="submit" className="p-2.5 rounded-xl bg-brand-lime text-background hover:bg-brand-lime-hover">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
