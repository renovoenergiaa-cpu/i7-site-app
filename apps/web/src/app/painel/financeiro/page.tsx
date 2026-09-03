'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowDownRight, 
  ArrowUpRight, 
  Plus, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  X
} from 'lucide-react';
import { GestaoBoleto, INITIAL_BOLETOS, getStoredData, saveStoredData } from '@/lib/gestaoData';

interface AsaasAccountInfo {
  connected: boolean;
  environment: string;
  balance: number;
  accountStatus: {
    id?: string;
    commercialInfo?: string;
    bankAccountInfo?: string;
    documentation?: string;
  };
}

export default function FinanceAdminPage() {
  const [asaasInfo, setAsaasInfo] = useState<AsaasAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [boletos, setBoletos] = useState<GestaoBoleto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form para nova cobrança Asaas
  const [customerName, setCustomerName] = useState('Lucas Mendes Ferreira');
  const [customerEmail, setCustomerEmail] = useState('lucas.mendes@email.com');
  const [customerCpfCnpj, setCustomerCpfCnpj] = useState('123.456.789-00');
  const [amount, setAmount] = useState(5630);
  const [description, setDescription] = useState('Aluguel Sala 101 - Edifício Paulista Corporate');
  const [createdPix, setCreatedPix] = useState<any>(null);

  const fetchAsaasData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/asaas');
      const data = await res.json();
      setAsaasInfo(data);
    } catch (err) {
      console.error('Erro ao consultar Asaas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsaasData();
    setBoletos(getStoredData('boletos', INITIAL_BOLETOS));
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateAsaasCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPayment(true);
    try {
      const res = await fetch('/api/asaas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerCpfCnpj,
          value: amount,
          description,
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
        })
      });

      const data = await res.json();
      if (data.success && data.payment) {
        // Salva na lista de boletos do sistema
        const newBoleto: GestaoBoleto = {
          id: `bol-asaas-${data.payment.id}`,
          code: data.payment.id || `BOL-${Date.now()}`,
          unitName: 'Sala 101 - Edifício Paulista Corporate',
          tenantName: customerName,
          ownerName: 'Eduardo Silveira Ramos',
          amount: Number(amount),
          dueDate: data.payment.dueDate || '10/10/2026',
          status: 'EM_ABERTO',
          dunningStep: 'LEMBRETE_PREVIO',
          barCode: data.payment.identificationField || data.payment.bankSlipUrl || '34191.79001 01043.510047 91020.150008 5 99410000563000',
          pixCode: data.pix?.payload || `00020126580014br.gov.bcb.pix0136${data.payment.id}`
        };

        const updated = [newBoleto, ...boletos];
        setBoletos(updated);
        saveStoredData('boletos', updated);
        setCreatedPix(data.pix);
        alert('Cobrança emitida com sucesso na API de Produção do Asaas!');
      } else {
        alert(`Aviso da API Asaas: ${data.error || 'Verifique os dados informados.'}`);
      }
    } catch (err: any) {
      alert(`Erro de conexão: ${err.message}`);
    } finally {
      setCreatingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-white rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-text-primary">Financeiro & Gateway Asaas</h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Produção Conectada
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Integração direta com o Banco Central e Gateway Asaas para emissão de PIX instantâneo e boletos registrados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAsaasData}
            className="p-2.5 rounded-xl bg-surface border border-border text-text-primary hover:border-brand-lime transition-all"
            title="Sincronizar Saldo Asaas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => { setIsModalOpen(true); setCreatedPix(null); }}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-brand-lime text-white hover:bg-brand-lime-hover transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Emitir Cobrança Asaas
          </button>
        </div>
      </div>

      {/* KPI Cards em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-brand-lime" /> Saldo em Conta Asaas
          </div>
          <div className="text-2xl font-black text-text-primary">
            R$ {asaasInfo ? asaasInfo.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Disponível para repasse imediato</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" /> A Receber (Mês)
          </div>
          <div className="text-2xl font-black text-text-primary">
            R$ {boletos.reduce((acc, b) => acc + (b.status === 'EM_ABERTO' ? b.amount : 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Total em boletos abertos</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-blue-600" /> Repasses Previstos
          </div>
          <div className="text-2xl font-black text-text-primary">
            R$ {boletos.reduce((acc, b) => acc + (b.status === 'EM_ABERTO' ? b.amount * 0.90 : 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Líquido para proprietários</div>
        </div>

        <div className="p-6 rounded-2xl bg-brand-lime text-white shadow-md">
          <div className="text-xs font-black uppercase tracking-wider mb-2 opacity-90">Taxa de Administração (10%)</div>
          <div className="text-2xl font-black">
            R$ {boletos.reduce((acc, b) => acc + (b.status === 'EM_ABERTO' ? b.amount * 0.10 : 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] opacity-90 mt-1">Receita estimada da imobiliária</div>
        </div>
      </div>

      {/* Tabela de Boletos & Cobranças Conectadas */}
      <div className="p-6 bg-white rounded-2xl border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-black text-text-primary">Cobranças & Faturas Registradas</h3>
            <p className="text-xs text-text-secondary">Boletos emitidos com QR Code PIX dinâmico do Banco Central</p>
          </div>
          <div className="text-xs font-bold text-text-secondary">
            Total: {boletos.length} cobranças
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Sacado (Inquilino)</th>
                <th className="p-3">Unidade</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Vencimento</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {boletos.map(b => (
                <tr key={b.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-text-primary">{b.code}</td>
                  <td className="p-3 font-bold text-text-primary">{b.tenantName}</td>
                  <td className="p-3 text-text-secondary">{b.unitName}</td>
                  <td className="p-3 font-black text-brand-lime">
                    R$ {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3">{b.dueDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      b.status === 'PAGO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleCopy(b.pixCode)}
                      className="px-2.5 py-1 rounded-lg bg-surface border border-border text-text-primary hover:border-brand-lime text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      {copiedCode === b.pixCode ? <Check className="w-3 h-3 text-brand-lime" /> : <QrCode className="w-3 h-3" />}
                      <span>{copiedCode === b.pixCode ? 'Copiado' : 'PIX'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Emitir Cobrança Real Asaas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Emitir Cobrança Oficial Asaas</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdPix ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-text-primary">Cobrança Registrada com Sucesso!</h4>
                {createdPix.encodedImage && (
                  <img 
                    src={`data:image/png;base64,${createdPix.encodedImage}`} 
                    alt="QR Code PIX Asaas" 
                    className="w-44 h-44 mx-auto rounded-xl border border-border shadow-sm"
                  />
                )}
                <div className="p-3 rounded-xl bg-white border border-border text-left">
                  <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Chave PIX Copia e Cola:</div>
                  <div className="font-mono text-[11px] text-text-primary break-all line-clamp-3">
                    {createdPix.payload}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(createdPix.payload)}
                  className="w-full py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> {copiedCode === createdPix.payload ? 'Código PIX Copiado!' : 'Copiar Chave PIX'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAsaasCharge} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Nome do Sacado (Inquilino)</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">CPF / CNPJ</label>
                    <input
                      type="text"
                      required
                      value={customerCpfCnpj}
                      onChange={(e) => setCustomerCpfCnpj(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Valor da Cobrança (R$)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    disabled={creatingPayment}
                    className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {creatingPayment ? 'Emitindo no Asaas...' : 'Emitir via Asaas'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
