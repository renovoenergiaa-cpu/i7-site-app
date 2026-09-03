'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Building, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  CreditCard, 
  Check, 
  User, 
  Phone, 
  Mail, 
  Sparkles,
  MessageSquare,
  Lock
} from 'lucide-react';
import { 
  RentalProposal, 
  INITIAL_PROPOSALS, 
  GuaranteeType, 
  getStoredData, 
  saveStoredData, 
  logAuditEvent 
} from '@/lib/gestaoData';

export default function PropostaDigitalPage() {
  const params = useParams();
  const id = params?.id as string;

  const [proposal, setProposal] = useState<RentalProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form states
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profession, setProfession] = useState('');
  const [income, setIncome] = useState<number>(0);
  const [guarantee, setGuarantee] = useState<GuaranteeType>('FIANCA_DIGITAL');
  
  // Arquivos mockados anexados
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; type: string; url: string }[]>([]);

  useEffect(() => {
    const proposals = getStoredData<RentalProposal[]>('proposals', INITIAL_PROPOSALS);
    const found = proposals.find(p => p.id === id || p.code === id) || proposals[0];
    
    if (found) {
      setProposal(found);
      setCpf(found.clientCpf || '');
      setBirthDate(found.clientBirthDate || '');
      setProfession(found.clientProfession || '');
      setIncome(found.clientIncome || found.rentValue * 3);
      setGuarantee(found.guaranteeType || 'FIANCA_DIGITAL');
      if (found.documents && found.documents.length > 0) {
        setUploadedDocs(found.documents);
      }
      if (found.status === 'EM_ANALISE_CREDITO' || found.status === 'APROVADA') {
        setIsSubmitted(true);
      }
    }
    setLoading(false);
  }, [id]);

  const handleSimulateUpload = (type: string, defaultName: string) => {
    const newDoc = {
      name: defaultName,
      type,
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'
    };
    setUploadedDocs(prev => [...prev.filter(d => d.type !== type), newDoc]);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal) return;

    const proposals = getStoredData<RentalProposal[]>('proposals', INITIAL_PROPOSALS);
    const updatedProposal: RentalProposal = {
      ...proposal,
      clientCpf: cpf || '341.892.418-09',
      clientBirthDate: birthDate || '14/07/1992',
      clientProfession: profession || 'Profissional Autônomo / CLT',
      clientIncome: Number(income) || proposal.rentValue * 3,
      guaranteeType: guarantee,
      creditScore: 840,
      documents: uploadedDocs.map(d => ({ ...d, uploadedAt: new Date().toLocaleString('pt-BR') })),
      status: 'EM_ANALISE_CREDITO',
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = proposals.map(p => p.id === proposal.id ? updatedProposal : p);
    setProposal(updatedProposal);
    saveStoredData('proposals', updated);
    setIsSubmitted(true);

    logAuditEvent(
      'PROPOSTA_ENVIADA_CLIENTE',
      'Propostas de Locação',
      `Cliente "${updatedProposal.clientName}" enviou proposta e documentos para o imóvel "${updatedProposal.unitName}".`,
      updatedProposal.clientEmail
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-text-primary">Proposta não encontrada</h2>
        <Link href="/" className="mt-4 text-sm text-brand-lime font-bold">Voltar ao site da i7</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-white to-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-50 border border-brand-lime/30 text-lime-800 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
            <span>Esteira de Locação 100% Digital i7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Proposta & Fechamento de Aluguel
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
            Sem burocracia, sem fiador tradicional e sem precisar ir ao cartório. Assine digitalmente pelo celular.
          </p>
        </div>

        {/* Card do Imóvel & Resumo de Valores */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <span className="font-mono text-xs font-black text-brand-lime bg-surface px-2 py-0.5 rounded border border-border">
                {proposal.code}
              </span>
              <h2 className="text-lg font-black text-text-primary mt-1">{proposal.propertyTitle}</h2>
              <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                <span>{proposal.propertyAddress}</span>
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-bold text-text-secondary uppercase block">Pacote Mensal Total</span>
              <span className="text-2xl font-black text-brand-lime">
                R$ {proposal.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-surface border border-border">
              <span className="text-text-secondary block text-[10px]">Aluguel Base</span>
              <span className="font-bold text-text-primary">R$ {proposal.rentValue.toLocaleString('pt-BR')}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface border border-border">
              <span className="text-text-secondary block text-[10px]">Condomínio</span>
              <span className="font-bold text-text-primary">R$ {proposal.condoValue.toLocaleString('pt-BR')}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface border border-border">
              <span className="text-text-secondary block text-[10px]">IPTU Estimado</span>
              <span className="font-bold text-text-primary">R$ {proposal.iptuValue.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* TELA DE SUCESSO: QUANDO JÁ ENVIADO */}
        {isSubmitted ? (
          <div className="p-8 rounded-3xl bg-white border border-border shadow-xl text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-text-primary">Proposta Enviada com Sucesso!</h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                Olá, <strong>{proposal.clientName}</strong>! Seus documentos foram recebidos pela nossa equipe de crédito. A análise leva em média até <strong>2 horas úteis</strong>.
              </p>
            </div>

            {/* Timeline das 4 Etapas */}
            <div className="p-6 rounded-2xl bg-surface border border-border text-left space-y-4 max-w-lg mx-auto">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Status da sua locação:</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">✓</div>
                  <span className="font-bold text-text-primary">1. Visita presencial realizada e proposta enviada</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-lime text-white flex items-center justify-center font-bold text-[10px] animate-pulse">2</div>
                  <span className="font-bold text-brand-lime">2. Análise de crédito digital em andamento</span>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-[10px]">3</div>
                  <span className="font-medium text-text-secondary">3. Assinatura eletrônica do contrato (pelo celular)</span>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-[10px]">4</div>
                  <span className="font-medium text-text-secondary">4. Laudo de Vistoria de Entrada e Retirada das Chaves</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/5515999990000?text=Ol%C3%A1%2C%20acabei%20de%20enviar%20minha%20proposta%20de%20loca%C3%A7%C3%A3o%20pelo%20site%20da%20i7!"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Acompanhar com o Corretor no WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO COMPLETO DE PROPOSTA */
          <form onSubmit={handleSubmitProposal} className="space-y-6">
            
            {/* 1. Dados do Locatário */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <User className="w-4 h-4 text-brand-lime" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  1. Seus Dados Pessoais & Renda
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={proposal.clientName}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Data de Nascimento</label>
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Profissão / Ocupação *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Engenheiro, Advogado, Analista..."
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Renda Mensal Comprovada (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">R$</span>
                    <input
                      type="number"
                      required
                      min={proposal.rentValue}
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-border text-sm font-black text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Recomendado: renda mensal líquida a partir de 3x o valor do aluguel (R$ {(proposal.rentValue * 3).toLocaleString('pt-BR')}).
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Escolha da Modalidade de Garantia */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <ShieldCheck className="w-4 h-4 text-brand-lime" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  2. Escolha a Modalidade de Garantia
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Fiança Digital i7 */}
                <button
                  type="button"
                  onClick={() => setGuarantee('FIANCA_DIGITAL')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer relative ${
                    guarantee === 'FIANCA_DIGITAL'
                      ? 'bg-lime-50/50 border-brand-lime shadow-md ring-2 ring-brand-lime/20'
                      : 'bg-white border-border hover:border-text-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-brand-lime text-white uppercase">
                      Mais Rápido
                    </span>
                    {guarantee === 'FIANCA_DIGITAL' && <Check className="w-4 h-4 text-brand-lime" />}
                  </div>
                  <h4 className="font-black text-xs text-text-primary">Fiança Digital i7</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Sem necessidade de fiador e sem desembolso inicial. Análise instantânea.
                  </p>
                </button>

                {/* Depósito Caução */}
                <button
                  type="button"
                  onClick={() => setGuarantee('CAUCAO')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                    guarantee === 'CAUCAO'
                      ? 'bg-lime-50/50 border-brand-lime shadow-md ring-2 ring-brand-lime/20'
                      : 'bg-white border-border hover:border-text-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">3 Aluguéis</span>
                    {guarantee === 'CAUCAO' && <Check className="w-4 h-4 text-brand-lime" />}
                  </div>
                  <h4 className="font-black text-xs text-text-primary">Depósito Caução</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Valor depositado em conta caução e restituído integralmente na devolução das chaves.
                  </p>
                </button>

                {/* Seguro Fiança */}
                <button
                  type="button"
                  onClick={() => setGuarantee('SEGURO_FIANCA')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                    guarantee === 'SEGURO_FIANCA'
                      ? 'bg-lime-50/50 border-brand-lime shadow-md ring-2 ring-brand-lime/20'
                      : 'bg-white border-border hover:border-text-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Seguradora</span>
                    {guarantee === 'SEGURO_FIANCA' && <Check className="w-4 h-4 text-brand-lime" />}
                  </div>
                  <h4 className="font-black text-xs text-text-primary">Seguro Fiança</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Apolice mensal emitida pelas principais seguradoras do país (Porto Seguro/Tokio).
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Upload Simplificado de Documentos */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <FileText className="w-4 h-4 text-brand-lime" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  3. Envio de Documentos (Pelo Celular ou Computador)
                </h3>
              </div>

              <div className="space-y-3">
                {/* Doc 1: RG / CNH */}
                <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3">
                  <div>
                    <strong className="block text-xs text-text-primary font-bold">1. Documento com Foto (RG ou CNH) *</strong>
                    <span className="text-[11px] text-text-secondary">Foto frente e verso do documento</span>
                  </div>
                  {uploadedDocs.some(d => d.type === 'IDENTIDADE') ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Anexado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('IDENTIDADE', 'RG_CNH_Digital.pdf')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-border hover:border-brand-lime text-text-primary font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-brand-lime" />
                      <span>Anexar Foto</span>
                    </button>
                  )}
                </div>

                {/* Doc 2: Comprovante de Renda */}
                <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3">
                  <div>
                    <strong className="block text-xs text-text-primary font-bold">2. Comprovante de Renda *</strong>
                    <span className="text-[11px] text-text-secondary">Últimos 3 holerites, extrato bancário ou IR</span>
                  </div>
                  {uploadedDocs.some(d => d.type === 'RENDA') ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Anexado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('RENDA', 'Comprovante_Renda_Holerites.pdf')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-border hover:border-brand-lime text-text-primary font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-brand-lime" />
                      <span>Anexar Arquivo</span>
                    </button>
                  )}
                </div>

                {/* Doc 3: Comprovante de Residência */}
                <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3">
                  <div>
                    <strong className="block text-xs text-text-primary font-bold">3. Comprovante de Residência</strong>
                    <span className="text-[11px] text-text-secondary">Conta de consumo recente (luz, água ou telefone)</span>
                  </div>
                  {uploadedDocs.some(d => d.type === 'RESIDENCIA') ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Anexado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('RESIDENCIA', 'Comprovante_Residencia.pdf')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-border hover:border-brand-lime text-text-primary font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-brand-lime" />
                      <span>Anexar Arquivo</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-lime-50/60 border border-lime-200/60 text-[11px] text-lime-900">
                <Lock className="w-4 h-4 text-lime-600 shrink-0" />
                <span>Seus dados e documentos são protegidos com criptografia de ponta a ponta conforme a LGPD.</span>
              </div>
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-brand-lime hover:bg-brand-lime-hover text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Enviar Proposta para Análise de Crédito</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
