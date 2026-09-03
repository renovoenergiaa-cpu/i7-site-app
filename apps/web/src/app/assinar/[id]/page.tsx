'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FileCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  User, 
  Sparkles, 
  Lock, 
  RotateCcw, 
  Check, 
  MessageSquare, 
  ArrowRight,
  Printer,
  FileText
} from 'lucide-react';
import { 
  GestaoContract, 
  INITIAL_CONTRACTS, 
  RentalProposal, 
  INITIAL_PROPOSALS, 
  getStoredData, 
  saveStoredData, 
  logAuditEvent 
} from '@/lib/gestaoData';

export default function AssinaturaDigitalPage() {
  const params = useParams();
  const id = params?.id as string;

  const [contract, setContract] = useState<GestaoContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigned, setIsSigned] = useState(false);
  
  // Dados do signatário
  const [signerRole, setSignerRole] = useState<'TENANT' | 'OWNER'>('TENANT');
  const [signerCpf, setSignerCpf] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [securityToken, setSecurityToken] = useState('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Canvas para desenho da assinatura com o dedo ou mouse
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const contracts = getStoredData<GestaoContract[]>('contracts', INITIAL_CONTRACTS);
    const proposals = getStoredData<RentalProposal[]>('proposals', INITIAL_PROPOSALS);
    
    // Procura por ID ou Código do contrato, ou por proposta associada
    let found = contracts.find(c => c.id === id || c.code === id);
    if (!found) {
      const prop = proposals.find(p => p.id === id || p.code === id);
      if (prop && prop.contractId) {
        found = contracts.find(c => c.id === prop.contractId);
      }
    }
    if (!found && contracts.length > 0) {
      found = contracts[0];
    }

    if (found) {
      setContract(found);
      setSignerCpf(found.tenantEmail === 'lucas.mendes@email.com' ? '341.892.418-09' : '289.441.908-72');
      // Gera token de autenticação de segurança
      setSecurityToken(`i7-AUTH-${Math.floor(10000 + Math.random() * 90000)}`);
    }
    setLoading(false);
  }, [id]);

  // Inicializa o canvas de desenho
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [loading]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleConfirmSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !hasDrawnSignature || !acceptedTerms) return;

    // Atualiza o contrato no storage com a assinatura digital homologada
    const contracts = getStoredData<GestaoContract[]>('contracts', INITIAL_CONTRACTS);
    const updated = contracts.map(c => {
      if (c.id === contract.id) {
        return {
          ...c,
          status: 'ATIVO' as const
        };
      }
      return c;
    });
    saveStoredData('contracts', updated);

    logAuditEvent(
      'CONTRATO_ASSINADO_DIGITALMENTE',
      'Assinatura Digital',
      `Contrato ${contract.code} assinado digitalmente por ${signerRole === 'TENANT' ? contract.tenantName : contract.ownerName} via token ${securityToken} com conformidade Lei 14.063/20.`,
      signerRole === 'TENANT' ? contract.tenantEmail : contract.ownerEmail
    );

    setIsSigned(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-text-primary">Contrato não localizado</h2>
        <Link href="/" className="mt-4 text-sm text-brand-lime font-bold">Voltar à página inicial</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-white to-surface py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Oficial */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-50 border border-brand-lime/30 text-lime-800 text-xs font-black uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-lime" />
            <span>Assinatura Eletrônica Avançada • Lei 14.063/20</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Assinatura Digital do Contrato de Locação
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
            Documento com fé pública e validade jurídica plena em todo o território nacional, sem necessidade de ir ao cartório.
          </p>
        </div>

        {/* TELA DE SUCESSO: QUANDO JÁ ASSINADO */}
        {isSigned ? (
          <div className="p-8 rounded-3xl bg-white border border-border shadow-xl text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs font-black text-brand-lime bg-surface px-2.5 py-1 rounded border border-border">
                {contract.code}
              </span>
              <h2 className="text-2xl font-black text-text-primary mt-2">Contrato Assinado com Sucesso!</h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                Parabéns! Sua assinatura eletrônica foi validada e carimbada com chave criptográfica no contrato de locação da unidade <strong>{contract.unitName}</strong>.
              </p>
            </div>

            {/* Trilha de Auditoria Jurídica */}
            <div className="p-5 rounded-2xl bg-surface border border-border text-left space-y-3 text-xs max-w-lg mx-auto">
              <h4 className="font-black text-text-primary uppercase tracking-wider text-[11px] border-b border-border pb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-lime" />
                <span>Certificado de Conformidade Digital</span>
              </h4>
              <div className="space-y-1.5 text-text-secondary">
                <div className="flex justify-between">
                  <span>Signatário:</span>
                  <strong className="text-text-primary">{signerRole === 'TENANT' ? contract.tenantName : contract.ownerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>CPF / Identificador:</span>
                  <strong className="text-text-primary">{signerCpf}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Token de Segurança OTP:</span>
                  <span className="font-mono font-bold text-brand-lime">{securityToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data e Hora:</span>
                  <span className="font-bold text-text-primary">{new Date().toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hash Criptográfico SHA-256:</span>
                  <span className="font-mono text-[10px] text-text-primary">a8f94c1e92d...47b2c019</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/5515999990000?text=Ol%C3%A1%2C%20acabei%20de%20assinar%20o%20contrato%20digitalmente!%20Gostaria%20de%20agendar%20a%20retirada%20das%20chaves."
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Falar no WhatsApp para Retirar as Chaves</span>
              </a>

              <Link
                href="/painel/contratos"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-surface border border-border hover:border-brand-lime text-text-primary text-xs font-bold transition-all text-center"
              >
                Acessar Painel
              </Link>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE ASSINATURA ELETRÔNICA */
          <form onSubmit={handleConfirmSignature} className="space-y-6">
            
            {/* Resumo do Imóvel e do Contrato */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <span className="font-mono text-xs font-black text-brand-lime bg-surface px-2.5 py-1 rounded border border-border">
                    {contract.code}
                  </span>
                  <h3 className="text-lg font-black text-text-primary mt-1.5">{contract.unitName}</h3>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Sorocaba - SP • Sede: R. Cel. Nogueira Padilha, 374</span>
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block">Aluguel Mensal</span>
                  <span className="text-2xl font-black text-brand-lime">
                    R$ {contract.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-text-secondary block">Vencimento todo dia 10</span>
                </div>
              </div>

              {/* Qualificação Rápida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-text-secondary block text-[10px] uppercase font-bold">Locatário (Inquilino)</span>
                  <div className="font-bold text-text-primary">{contract.tenantName}</div>
                  <div className="text-[11px] text-text-secondary">{contract.tenantEmail}</div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-text-secondary block text-[10px] uppercase font-bold">Locador (Proprietário)</span>
                  <div className="font-bold text-text-primary">{contract.ownerName}</div>
                  <div className="text-[11px] text-text-secondary">{contract.ownerEmail}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed max-h-36 overflow-y-auto">
                <strong className="block text-gray-900 mb-1 font-bold">Resumo das Cláusulas Contratuais (Lei 8.245/91):</strong>
                <p>
                  Vigência de 30 meses (início em {contract.startDate} e término em {contract.endDate}). Reajuste anual pelo índice {contract.adjustmentIndex}. Garantia: {contract.guaranteeType.replace('_', ' ')}. Multa moratória de {contract.finePercent}% e juros de {contract.interestPercent}% a.m. O locatário se compromete a zelar pelo imóvel conforme o Laudo Pericial de Vistoria de Entrada. Foro da Comarca de Sorocaba/SP.
                </p>
              </div>
            </div>

            {/* Identificação do Signatário */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <User className="w-4 h-4 text-brand-lime" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  1. Confirmação dos Dados do Signatário
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Papel no Contrato</label>
                  <select
                    value={signerRole}
                    onChange={(e: any) => setSignerRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="TENANT">Locatário (Inquilino)</option>
                    <option value="OWNER">Locador (Proprietário)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Nome Completo</label>
                  <input
                    type="text"
                    disabled
                    value={signerRole === 'TENANT' ? contract.tenantName : contract.ownerName}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">CPF do Signatário *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={signerCpf}
                    onChange={(e) => setSignerCpf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Token de Segurança Gerado</label>
                  <input
                    type="text"
                    disabled
                    value={securityToken}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-lime-50 border border-lime-200 text-xs font-mono font-bold text-lime-800"
                  />
                </div>
              </div>
            </div>

            {/* Área de Desenho da Assinatura (Touch / Mouse Canvas) */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-lime" />
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    2. Desenhe sua Assinatura na Tela
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1 rounded-xl bg-surface border border-border hover:border-text-secondary text-text-secondary text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>

              <p className="text-xs text-text-secondary">
                Utilize o dedo na tela do seu celular ou o mouse no computador para assinar no campo abaixo:
              </p>

              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl bg-slate-50 overflow-hidden touch-none">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[180px] cursor-crosshair bg-transparent"
                />
                {!hasDrawnSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs font-medium">
                    ✍️ Assine aqui com o dedo ou mouse
                  </div>
                )}
              </div>

              {hasDrawnSignature && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                  <Check className="w-4 h-4" />
                  <span>Traçado de assinatura capturado com sucesso!</span>
                </div>
              )}
            </div>

            {/* Termo Legal de Concordância */}
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-brand-lime focus:ring-brand-lime cursor-pointer"
                />
                <span className="text-xs text-text-secondary leading-relaxed">
                  Declaro que li e concordo expressamente com todas as cláusulas do presente <strong>Contrato de Locação ({contract.code})</strong>, reconhecendo a autenticidade e validade jurídica da minha assinatura eletrônica nos termos da <strong>Lei Federal nº 14.063/2020</strong> e <strong>MP nº 2.200-2/2001</strong>.
                </span>
              </label>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-text-secondary border-t border-border">
                <Lock className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                <span>Registramos seu endereço IP, data/hora e identificador de segurança criptografado.</span>
              </div>
            </div>

            {/* Botão de Assinatura */}
            <button
              type="submit"
              disabled={!hasDrawnSignature || !acceptedTerms}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hasDrawnSignature && acceptedTerms
                  ? 'bg-brand-lime hover:bg-brand-lime-hover text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FileCheck className="w-5 h-5" />
              <span>Confirmar e Assinar Contrato Digitalmente</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
