'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchPropertyById } from '@/lib/api';
import { PropertyDTO } from '@i7/types';
import { 
  MapPin, 
  Calendar, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  X, 
  User, 
  Lock, 
  Phone,
  Maximize2,
  Camera
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { getCurrentSession } from '@/lib/auth';
import { ScheduledVisit, INITIAL_VISITS, getStoredData, saveStoredData, logAuditEvent } from '@/lib/gestaoData';
import { PropertyMap } from '@/components/PropertyMap';
import { ImageSliderModal } from '@/components/ImageSliderModal';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  
  // Lightbox Slide Modal
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderInitialIndex, setSliderInitialIndex] = useState(0);
  
  // Modals
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [visitDate, setVisitDate] = useState('');
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

    let rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
    if (!rawId && typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      rawId = parts[parts.length - 1];
    }
    const propertyId = rawId ? decodeURIComponent(rawId).trim().replace(/\/$/, '') : '';

    if (propertyId) {
      const loadProperty = async () => {
        try {
          let data = await fetchPropertyById(propertyId);
          if (!data) {
            await new Promise(r => setTimeout(r, 400));
            data = await fetchPropertyById(propertyId);
          }
          setProperty(data);
          if (data) setProposalAmount(data.rentPrice);
        } finally {
          setLoading(false);
        }
      };
      loadProperty();
    } else {
      setLoading(false);
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-lime border-t-transparent animate-spin mx-auto" />
        <p className="text-text-secondary font-medium">Carregando detalhes do imóvel i7...</p>
      </div>
    );
  }

  if (!property) {
    let rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
    const targetId = rawId ? decodeURIComponent(rawId).trim().replace(/\/$/, '') : '';

    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-black text-text-primary">Imóvel não encontrado</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Este imóvel pode estar sendo atualizado, reservado ou com o anúncio em sincronização.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchPropertyById(targetId).then(d => {
                setProperty(d);
                setLoading(false);
              });
            }}
            className="px-5 py-2.5 rounded-xl border border-border bg-surface-hover hover:bg-border text-text-primary text-xs font-bold transition-all"
          >
            Tentar carregar novamente
          </button>
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-lime text-white font-bold text-xs shadow hover:bg-brand-lime-hover transition-all"
          >
            Ver outros imóveis
          </Link>
        </div>
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

  const getWhatsAppPropertyUrl = () => {
    if (!property) return 'https://wa.me/5515988145050';

    const rentFormatted = property.rentPrice
      ? `R$ ${property.rentPrice.toLocaleString('pt-BR')}/mês`
      : 'A consultar';
    const totalFormatted = property.totalMonthly
      ? ` (Total estimado com taxas: R$ ${property.totalMonthly.toLocaleString('pt-BR')}/mês)`
      : '';
    const addressFormatted = `${property.street}, ${property.number} - ${property.neighborhood}, ${property.city}/${property.state}`;
    const urlImovel = typeof window !== 'undefined' ? window.location.href : `https://i7imob.com.br/imoveis/${property.id}`;

    const message = `Olá, equipe i7 Inteligência Imobiliária! 👋\nTenho interesse e gostaria de mais informações sobre este imóvel que vi no site:\n\n🏢 *${property.title}*\n📍 Localização: ${addressFormatted}\n💰 Valor: ${rentFormatted}${totalFormatted}\n📐 Área: ${property.areaSqm} m² | ${property.bedrooms} Quartos | ${property.bathrooms} Banheiros | ${property.parkingSpots} Vagas\n🔗 Link do Imóvel: ${urlImovel}\n\nPoderiam me passar mais informações e disponibilidade para visita? Obrigado!`;

    return `https://wa.me/5515988145050?text=${encodeURIComponent(message)}`;
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
                href={`https://wa.me/5515988145050?text=${encodeURIComponent(
                  `Olá! Gostaria de falar sobre a minha solicitação de visita presencial ao imóvel "${property.title}" agendada para ${scheduledVisitData.scheduledDate.replace('T', ' às ')}. Meu nome é ${scheduledVisitData.clientName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow transition-all shrink-0"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
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
          <a 
            href={getWhatsAppPropertyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-sm font-bold text-white flex items-center gap-2 transition-all shadow-md hover:scale-[1.02]"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" /> Conversar no WhatsApp
          </a>
        </div>
      </div>

      {/* GALLERY GRID WITH SLIDE TRIGGER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Photo with Slide Controls & Click-to-Expand */}
        <div 
          onClick={() => {
            setSliderInitialIndex(activeMediaIndex);
            setSliderOpen(true);
          }}
          className="md:col-span-2 relative h-96 sm:h-[480px] rounded-3xl overflow-hidden glass-card cursor-pointer group shadow-md"
        >
          <img 
            src={property.media[activeMediaIndex]?.url || property.media[0]?.url} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />

          {/* Seta Anterior (Slide na página) */}
          {property.media.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMediaIndex((prev) => (prev - 1 + property.media.length) % property.media.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-brand-lime text-white hover:text-black flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-xl border border-white/20 hover:border-brand-lime hover:scale-110 active:scale-95"
              title="Foto anterior"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Seta Próxima (Slide na página) */}
          {property.media.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMediaIndex((prev) => (prev + 1) % property.media.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-brand-lime text-white hover:text-black flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-xl border border-white/20 hover:border-brand-lime hover:scale-110 active:scale-95"
              title="Próxima foto"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Hover Overlay Hint */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-4 py-2 rounded-full bg-black/70 text-white text-xs font-bold backdrop-blur-md flex items-center gap-2 shadow-2xl border border-white/20">
              <Maximize2 className="w-4 h-4 text-brand-lime" /> Clique para abrir galeria em tela cheia (Slide)
            </span>
          </div>

          {/* Tour 360 Badge */}
          {property.hasVirtualTour && (
            <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md text-xs font-bold text-brand-lime border border-brand-lime/40 flex items-center gap-2 shadow-lg">
              <Sparkles className="w-4 h-4" /> Tour Virtual 360° Disponível
            </div>
          )}

          {/* Botão Ver todas as fotos / Slide */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSliderInitialIndex(activeMediaIndex);
              setSliderOpen(true);
            }}
            className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl bg-black/80 hover:bg-black text-white hover:text-brand-lime text-xs font-bold border border-white/20 backdrop-blur-md flex items-center gap-2 shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <Camera className="w-4 h-4 text-brand-lime" />
            <span>Ver fotos ({activeMediaIndex + 1}/{property.media.length})</span>
            <Maximize2 className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0">
          {property.media.map((item, idx) => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveMediaIndex(idx);
                setSliderInitialIndex(idx);
                setSliderOpen(true);
              }}
              className={`relative h-24 md:h-[110px] w-36 md:w-full rounded-2xl overflow-hidden border-2 transition-all shrink-0 group/thumb cursor-pointer ${
                activeMediaIndex === idx 
                  ? 'border-brand-lime shadow-glow-lime scale-[1.01]' 
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
              title={`Ver foto ${idx + 1} em tela cheia`}
            >
              <img src={item.url} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
              <div className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono font-bold text-white">
                {idx + 1}
              </div>
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

          {/* Localização no Mapa com Pin */}
          <div className="p-6 rounded-2xl glass-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-lime" /> Localização no Mapa
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {property.street}, {property.number} — {property.neighborhood}, {property.city} - {property.state}
                </p>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-brand-lime/10 text-brand-lime px-3 py-1 rounded-full border border-brand-lime/30">
                {property.city || 'Sorocaba'}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-border shadow-inner" style={{ height: '350px', width: '100%' }}>
              <PropertyMap 
                properties={[property]} 
                searchMode="rent" 
                height="350px"
              />
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
              {property.condoFee > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Condomínio</span>
                  <span className="text-text-primary font-semibold">R$ {property.condoFee.toLocaleString('pt-BR')}</span>
                </div>
              )}
              {property.iptuFee > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Taxa de Administração</span>
                  <span className="text-text-primary font-semibold">R$ {property.iptuFee.toLocaleString('pt-BR')}</span>
                </div>
              )}
              {property.serviceFee > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Taxa de Serviço</span>
                  <span className="text-brand-lime font-semibold">R$ {property.serviceFee.toLocaleString('pt-BR')}</span>
                </div>
              )}
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

              <a 
                href={getWhatsAppPropertyUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01]"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white" /> Conversar no WhatsApp
              </a>
            </div>

            <div className="text-[11px] text-text-muted flex items-center gap-1.5 pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-lime" /> Aluguel sem fiador e com aprovação imediata.
            </div>

          </div>

        </div>

      </div>

      {/* SCHEDULE VISIT MODAL */}
      {visitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                  <Calendar className="w-5 h-5" />
                </div>
                <span>Agendar Visita i7</span>
              </h3>
              <button 
                onClick={() => setVisitModalOpen(false)} 
                className="p-2 rounded-full hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/30 text-xs text-brand-lime font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Visita Presencial Oficial com Corretor Especialista i7</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Seu Nome Completo *</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime focus:bg-white transition-all"
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
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Data e Horário Desejados *</label>
                <input 
                  type="datetime-local" 
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime focus:bg-white transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Observações (Opcional)</label>
                <textarea 
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Ex: Gostaria de visitar no período da tarde..."
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime focus:bg-white transition-all"
                  rows={2}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 rounded-xl font-bold bg-brand-lime text-background hover:bg-brand-lime-hover shadow-glow-lime flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                Confirmar Solicitação de Visita
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROPOSAL MODAL */}
      {proposalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                  <Send className="w-5 h-5" />
                </div>
                <span>Enviar Proposta de Aluguel</span>
              </h3>
              <button 
                onClick={() => setProposalModalOpen(false)} 
                className="p-2 rounded-full hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Valor Ofertado (R$/mês) *</label>
                <input 
                  type="number" 
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-base text-text-primary font-black focus:outline-none focus:border-brand-lime focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Observações para o Proprietário</label>
                <textarea 
                  rows={3}
                  placeholder="Ex: Gostaria de iniciar o contrato dia 15..."
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime focus:bg-white transition-all"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 rounded-xl font-bold bg-brand-lime text-background hover:bg-brand-lime-hover shadow-glow-lime transition-all transform active:scale-95"
              >
                Enviar Proposta Oficial
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX SLIDE MODAL */}
      <ImageSliderModal
        isOpen={sliderOpen}
        onClose={() => setSliderOpen(false)}
        images={property.media.map((item, i) => ({
          url: item.url,
          alt: `${property.title} - Foto ${i + 1}`,
          caption: property.title
        }))}
        initialIndex={sliderInitialIndex}
        title={property.title}
      />

    </div>
  );
}
