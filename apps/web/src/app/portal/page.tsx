'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Home, 
  FileText, 
  Receipt, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wrench, 
  FolderOpen, 
  Bell, 
  BarChart3, 
  User, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  X, 
  ShieldCheck, 
  Send,
  Eye,
  LogOut,
  Calendar,
  Printer
} from 'lucide-react';
import { getCurrentSession, logoutUser, UserSession } from '@/lib/auth';
import { 
  BuildingUnit, 
  GestaoContract, 
  GestaoBoleto, 
  GestaoPayment, 
  GestaoMaintenance, 
  GestaoDocument, 
  GestaoAnnouncement, 
  INITIAL_UNITS, 
  INITIAL_CONTRACTS, 
  INITIAL_BOLETOS, 
  INITIAL_PAYMENTS, 
  INITIAL_MAINTENANCES, 
  INITIAL_DOCUMENTS, 
  INITIAL_ANNOUNCEMENTS,
  getStoredData, 
  saveStoredData 
} from '@/lib/gestaoData';

export default function PortalUnificadoPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Active Persona (Owner vs Tenant)
  const [portalMode, setPortalMode] = useState<'OWNER' | 'TENANT'>('OWNER');
  
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Shared Data
  const [units, setUnits] = useState<BuildingUnit[]>([]);
  const [contracts, setContracts] = useState<GestaoContract[]>([]);
  const [boletos, setBoletos] = useState<GestaoBoleto[]>([]);
  const [payments, setPayments] = useState<GestaoPayment[]>([]);
  const [maintenances, setMaintenances] = useState<GestaoMaintenance[]>([]);
  const [documents, setDocs] = useState<GestaoDocument[]>([]);
  const [announcements, setAnnouncements] = useState<GestaoAnnouncement[]>([]);

  // UI helpers
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [viewingBoleto, setViewingBoleto] = useState<GestaoBoleto | null>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'ELETRICA' | 'HIDRAULICA' | 'ESTRUTURAL' | 'PINTURA' | 'OUTROS'>('HIDRAULICA');
  const [ticketUrgency, setTicketUrgency] = useState<'BAIXA' | 'MEDIA' | 'ALTA' | 'EMERGENCIA'>('ALTA');
  const [ticketDescription, setTicketDescription] = useState('');
  
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const s = getCurrentSession();
    setSession(s);

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view');
      if (viewParam === 'owner') {
        setPortalMode('OWNER');
      } else if (viewParam === 'tenant') {
        setPortalMode('TENANT');
      } else if (s?.user?.role === 'TENANT') {
        setPortalMode('TENANT');
      } else {
        setPortalMode('OWNER');
      }
    } else if (s?.user?.role === 'TENANT') {
      setPortalMode('TENANT');
    } else {
      setPortalMode('OWNER');
    }

    setUnits(getStoredData('units', INITIAL_UNITS));
    setContracts(getStoredData('contracts', INITIAL_CONTRACTS));
    setBoletos(getStoredData('boletos', INITIAL_BOLETOS));
    setPayments(getStoredData('payments', INITIAL_PAYMENTS));
    setMaintenances(getStoredData('maintenances', INITIAL_MAINTENANCES));
    setDocs(getStoredData('documents', INITIAL_DOCUMENTS));
    setAnnouncements(getStoredData('announcements', INITIAL_ANNOUNCEMENTS));
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleConfirmReadAnnouncement = (annId: string) => {
    const updated = announcements.map(a => {
      if (a.id === annId) {
        const alreadyRead = a.readBy.some(r => r.userId === (session?.user?.id || 'curr-user'));
        if (!alreadyRead) {
          return {
            ...a,
            readBy: [
              ...a.readBy,
              {
                userId: session?.user?.id || 'curr-user',
                userName: session?.user?.name || (portalMode === 'OWNER' ? 'Eduardo Silveira Ramos' : 'Lucas Ferreira'),
                readAt: new Date().toLocaleString('pt-BR')
              }
            ]
          };
        }
      }
      return a;
    });

    setAnnouncements(updated);
    saveStoredData('announcements', updated);
    alert('Leitura confirmada com sucesso! O administrador já foi notificado.');
  };

  const handlePayBoletoWithPix = (boleto: GestaoBoleto) => {
    // 1. Atualiza o status do boleto para PAGO
    const updatedBoletos = boletos.map(b => {
      if (b.id === boleto.id) {
        return {
          ...b,
          status: 'PAGO' as const,
          paidAt: new Date().toLocaleDateString('pt-BR')
        };
      }
      return b;
    });
    setBoletos(updatedBoletos);
    saveStoredData('boletos', updatedBoletos);

    // 2. Registra o pagamento em payments para o extrato
    const newPayment: GestaoPayment = {
      id: `pay-${Date.now()}`,
      unitName: boleto.unitName,
      tenantName: boleto.tenantName,
      ownerName: boleto.ownerName,
      competence: '09/2026',
      expectedAmount: boleto.amount,
      receivedAmount: boleto.amount,
      adminFeeAmount: Math.round(boleto.amount * 0.10),
      expensesDeducted: 0,
      transferredAmount: Math.round(boleto.amount * 0.90),
      status: 'RECEBIDO_PENDENTE_REPASSE',
      receivedDate: new Date().toLocaleDateString('pt-BR'),
    };
    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    saveStoredData('payments', updatedPayments);

    alert(`✅ Pagamento de R$ ${boleto.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} confirmado via PIX com sucesso!\n\nSeu comprovante foi emitido e o boleto já consta como QUITADO no sistema.`);
  };

  const handleCreateTenantTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle) return;

    const newTicket: GestaoMaintenance = {
      id: `mnt-${Date.now()}`,
      title: ticketTitle,
      unitName: 'Apto 204 - Residencial Faria Lima Prime',
      requestedBy: session?.user?.name || 'Lucas Ferreira',
      requestedByRole: 'TENANT',
      category: ticketCategory,
      urgency: ticketUrgency,
      status: 'ABERTO',
      description: ticketDescription,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      photos: []
    };

    const updated = [newTicket, ...maintenances];
    setMaintenances(updated);
    saveStoredData('maintenances', updated);
    setIsNewTicketModalOpen(false);
    setTicketTitle('');
    setTicketDescription('');
    alert('Chamado de manutenção aberto com sucesso! A equipe técnica do condomínio já foi notificada.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/login';
  };

  // Filtered views based on mode and session
  const currentUserName = session?.user?.name || '';
  const currentUserEmail = session?.user?.email || '';

  // Verifica se é a conta fixa de demonstração ou uma conta real cadastrada
  const isDemoOwner = currentUserEmail.toLowerCase() === 'proprietario@i7.com.br';
  const isDemoTenant = currentUserEmail.toLowerCase() === 'inquilino@i7.com.br';

  // Owner view: Contas novas trazem EXCLUSIVAMENTE os dados reais delas (sem dados fictícios de terceiros)
  const userOwnedUnits = units.filter(u => 
    (currentUserEmail && u.ownerEmail.toLowerCase() === currentUserEmail.toLowerCase()) ||
    (currentUserName && u.ownerName.toLowerCase().includes(currentUserName.toLowerCase()))
  );
  const ownerUnits = isDemoOwner 
    ? units.filter(u => u.ownerName.includes('Eduardo') || u.ownerName.includes('Mariana') || u.ownerName.includes('Carlos'))
    : userOwnedUnits;

  const ownerContracts = contracts.filter(c => 
    isDemoOwner ? true : (currentUserEmail && c.ownerEmail.toLowerCase() === currentUserEmail.toLowerCase()) ||
    (currentUserName && c.ownerName.toLowerCase().includes(currentUserName.toLowerCase()))
  );

  const ownerBoletos = boletos.filter(b => 
    isDemoOwner ? true : (currentUserName && b.ownerName.toLowerCase().includes(currentUserName.toLowerCase())) ||
    ownerUnits.some(u => b.unitName.includes(u.unitNumber) || b.unitName.includes(u.buildingName))
  );

  const ownerPayments = payments.filter(p => 
    isDemoOwner ? true : (currentUserName && p.ownerName.toLowerCase().includes(currentUserName.toLowerCase())) ||
    ownerUnits.some(u => p.unitName.includes(u.unitNumber) || p.unitName.includes(u.buildingName))
  );

  const ownerMaintenances = maintenances.filter(m => 
    isDemoOwner ? true : ownerUnits.some(u => m.unitName.includes(u.unitNumber) || m.unitName.includes(u.buildingName))
  );

  const ownerDocuments = documents.filter(d => d.targetRole === 'TODOS' || d.targetRole === 'PROPRIETARIO');

  // Tenant view: Contas novas trazem EXCLUSIVAMENTE o contrato e boletos do inquilino cadastrado
  const realTenantContract = contracts.find(c => 
    (currentUserEmail && c.tenantEmail.toLowerCase() === currentUserEmail.toLowerCase()) ||
    (currentUserName && c.tenantName.toLowerCase().includes(currentUserName.toLowerCase()))
  );

  const tenantContract = isDemoTenant 
    ? (contracts.find(c => c.tenantName.includes('Lucas')) || contracts[0])
    : (realTenantContract || null);

  const tenantOpenBoletos = boletos.filter(b => {
    if (isDemoTenant) {
      return (b.tenantName.includes('Lucas') || b.tenantName.includes('TechSolutions')) &&
             (b.status === 'EM_ABERTO' || b.status === 'VENCIDO');
    }
    const matchesUser = (currentUserName && b.tenantName.toLowerCase().includes(currentUserName.toLowerCase())) ||
                        (tenantContract && b.unitName === tenantContract.unitName);
    return matchesUser && (b.status === 'EM_ABERTO' || b.status === 'VENCIDO');
  });

  const tenantPaidBoletos = boletos.filter(b => {
    if (isDemoTenant) {
      return (b.tenantName.includes('Lucas') || b.tenantName.includes('TechSolutions')) && b.status === 'PAGO';
    }
    const matchesUser = (currentUserName && b.tenantName.toLowerCase().includes(currentUserName.toLowerCase())) ||
                        (tenantContract && b.unitName === tenantContract.unitName);
    return matchesUser && b.status === 'PAGO';
  });

  const tenantMaintenances = maintenances.filter(m => {
    if (isDemoTenant) {
      return m.requestedBy.includes('Lucas') || m.requestedBy.includes('TechSolutions');
    }
    return currentUserName && m.requestedBy.toLowerCase().includes(currentUserName.toLowerCase());
  });

  const tenantDocuments = documents.filter(d => d.targetRole === 'TODOS' || d.targetRole === 'INQUILINO');

  // Tab definitions per persona (matching diagram exactly)
  const OWNER_TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'propriedades', label: 'Propriedades', icon: Building2 },
    { key: 'contratos', label: 'Contratos', icon: FileText },
    { key: 'boletos', label: 'Boletos', icon: Receipt },
    { key: 'pagamentos', label: 'Extrato & Despesas', icon: DollarSign },
    { key: 'repasses', label: 'Repasses', icon: ArrowUpRight },
    { key: 'manutencoes', label: 'Manutenções', icon: Wrench },
    { key: 'documentos', label: 'Documentos', icon: FolderOpen },
    { key: 'comunicados', label: 'Comunicados', icon: Bell },
    { key: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { key: 'perfil', label: 'Perfil', icon: User },
  ];

  const TENANT_TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'contrato', label: 'Meu Contrato', icon: FileText },
    { key: 'boletos', label: 'Boletos em Aberto', icon: Receipt },
    { key: 'pagamentos', label: 'Histórico de Pagos', icon: CheckCircle2 },
    { key: 'manutencoes', label: 'Manutenções & Chamados', icon: Wrench },
    { key: 'documentos', label: 'Documentos', icon: FolderOpen },
    { key: 'comunicados', label: 'Comunicados', icon: Bell },
    { key: 'perfil', label: 'Perfil', icon: User },
  ];

  const currentTabs = portalMode === 'OWNER' ? OWNER_TABS : TENANT_TABS;

  return (
    <div className="min-h-screen bg-surface/50 pb-20">
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Portal Official Header */}
        <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-lime text-white flex items-center justify-center font-black text-xl shadow-md">
              i7
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-text-primary">
                  {portalMode === 'OWNER' ? 'Área do Proprietário' : 'Área do Inquilino'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Ambiente Seguro
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {portalMode === 'OWNER' 
                  ? 'Acompanhe a rentabilidade do seu patrimônio, ocupação das unidades, contratos e repasses líquidos.' 
                  : 'Consulte seu contrato de locação, 2ª via de faturas com PIX e acompanhe chamados técnicos.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session?.user?.role === 'ADMIN' && (
              <Link 
                href="/painel" 
                className="px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-brand-lime text-xs font-bold text-text-primary transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>← Painel de Gestão</span>
              </Link>
            )}

            <div className="text-right text-xs">
              <div className="font-bold text-text-primary">
                {session?.user?.name || (portalMode === 'OWNER' ? 'Carlos Alberto Silva' : 'Mariana Costa Tech')}
              </div>
              <div className="text-text-secondary text-[11px]">
                {session?.user?.email || (portalMode === 'OWNER' ? 'proprietario@i7.com.br' : 'locatario@i7.com.br')}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                ● Conta Ativa
              </div>
            </div>

            <button 
              onClick={handleLogout}
              title="Encerrar Sessão"
              className="p-2.5 rounded-xl bg-surface border border-border hover:border-red-300 hover:text-red-500 text-text-secondary transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        <div className="bg-white rounded-2xl border border-border p-2 shadow-sm flex items-center gap-1.5 overflow-x-auto">
          {currentTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-brand-lime text-white shadow-sm' 
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* ======================= ABA: DASHBOARD ============================= */}
        {/* ==================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {portalMode === 'OWNER' ? (
              // Owner Dashboard
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Ocupação das Propriedades</div>
                    <div className="text-2xl font-black text-emerald-600">
                      {ownerUnits.length > 0 ? `${Math.round((ownerUnits.filter(u => u.status === 'LOCADO').length / ownerUnits.length) * 100)}%` : '0%'}
                    </div>
                    <div className="text-[11px] text-text-secondary mt-1">
                      {ownerUnits.length > 0 
                        ? `${ownerUnits.filter(u => u.status === 'LOCADO').length} de ${ownerUnits.length} unidade(s) locada(s)`
                        : 'Nenhum imóvel cadastrado no momento'}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Boletos Vencidos por Inquilinos</div>
                    <div className="text-2xl font-black text-red-600">
                      {ownerBoletos.filter(b => b.status === 'VENCIDO').length} pendente(s)
                    </div>
                    <div className="text-[11px] text-text-secondary mt-1">
                      {ownerBoletos.filter(b => b.status === 'VENCIDO').length > 0 ? 'Régua de cobrança automática ativa' : 'Zero inadimplência registrada'}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Chamados em Aberto</div>
                    <div className="text-2xl font-black text-purple-600">
                      {ownerMaintenances.filter(m => m.status !== 'CONCLUIDO').length} chamado(s)
                    </div>
                    <div className="text-[11px] text-text-secondary mt-1">
                      {ownerMaintenances.filter(m => m.status !== 'CONCLUIDO').length > 0 ? 'Em atendimento pela equipe técnica' : 'Nenhuma pendência estrutural'}
                    </div>
                  </div>
                </div>

                {/* Owner Recent Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-lime" /> Minhas Propriedades
                      </h3>
                      {ownerUnits.length > 0 && (
                        <button onClick={() => setActiveTab('propriedades')} className="text-xs font-bold text-brand-lime hover:underline cursor-pointer">
                          Ver detalhes
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {ownerUnits.length === 0 ? (
                        <div className="p-6 rounded-xl bg-surface border border-dashed border-border text-center space-y-2.5">
                          <p className="text-xs text-text-secondary">Você ainda não possui imóveis cadastrados sob nossa gestão.</p>
                          <Link href="/anunciar" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-sm transition-all">
                            <Plus className="w-3.5 h-3.5" /> Anunciar meu primeiro imóvel
                          </Link>
                        </div>
                      ) : (
                        ownerUnits.map(u => (
                          <div key={u.id} className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                            <div>
                              <div className="font-bold text-xs text-text-primary">{u.buildingName} - {u.unitNumber}</div>
                              <div className="text-[11px] text-text-secondary mt-0.5">Locatário: {u.tenantName || 'Disponível para locação'}</div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-700">
                              {u.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-brand-lime" /> Últimos Repasses Recebidos
                      </h3>
                      {ownerPayments.length > 0 && (
                        <button onClick={() => setActiveTab('repasses')} className="text-xs font-bold text-brand-lime hover:underline cursor-pointer">
                          Ver histórico
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {ownerPayments.length === 0 ? (
                        <div className="p-6 rounded-xl bg-surface border border-dashed border-border text-center">
                          <p className="text-xs text-text-secondary">Nenhum repasse registrado até o momento.</p>
                        </div>
                      ) : (
                        ownerPayments.map(p => (
                          <div key={p.id} className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                            <div>
                              <div className="font-bold text-xs text-text-primary">{p.unitName}</div>
                              <div className="text-[11px] text-text-secondary">Competência: {p.competence}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-xs text-emerald-600">
                                R$ {p.transferredAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-[10px] text-text-secondary">Repassado em {p.receivedDate}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Tenant Dashboard
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Boleto Atual em Aberto</div>
                    <div className="text-2xl font-black text-red-600">
                      R$ {tenantOpenBoletos[0]?.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                    <div className="text-[11px] text-text-secondary mt-1">
                      Vence em: {tenantOpenBoletos[0]?.dueDate || 'Sem débitos pendentes'}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Meus Chamados Ativos</div>
                    <div className="text-2xl font-black text-purple-600">
                      {tenantMaintenances.filter(m => m.status !== 'CONCLUIDO').length} chamado(s)
                    </div>
                    <div className="text-[11px] text-text-secondary mt-1">Em atendimento com técnico</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Avisos do Prédio</div>
                    <div className="text-2xl font-black text-brand-lime">
                      {announcements.length} comunicados
                    </div>
                    <div className="text-[11px] text-text-secondary mt-1">Mural atualizado da administração</div>
                  </div>
                </div>

                {/* Quick Pay Box */}
                {tenantOpenBoletos.length > 0 && (
                  <div className="p-6 rounded-2xl bg-brand-lime/10 border border-brand-lime/30 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-brand-lime text-background">
                        Pagamento Rápido PIX
                      </span>
                      <h3 className="text-base font-black text-text-primary">
                        Boleto do mês ({tenantOpenBoletos[0].dueDate}) disponível
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Copie a chave PIX Copia e Cola ou pague diretamente pelo seu banco.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setViewingBoleto(tenantOpenBoletos[0])}
                        className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-xs font-bold hover:border-brand-lime flex items-center gap-2 transition-all shadow-sm"
                      >
                        <FileText className="w-4 h-4 text-brand-lime" />
                        <span>Abrir Boleto Bancário</span>
                      </button>

                      <button
                        onClick={() => handlePayBoletoWithPix(tenantOpenBoletos[0])}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pagar com PIX (Baixa Imediata)</span>
                      </button>

                      <button
                        onClick={() => handleCopy(tenantOpenBoletos[0].pixCode)}
                        className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow flex items-center gap-2 transition-all"
                      >
                        {copiedCode === tenantOpenBoletos[0].pixCode ? <Check className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                        <span>{copiedCode === tenantOpenBoletos[0].pixCode ? 'PIX Copiado!' : 'Copiar Chave PIX'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(tenantOpenBoletos[0].barCode)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-border text-text-primary text-xs font-bold hover:border-brand-lime flex items-center gap-2 transition-all"
                      >
                        {copiedCode === tenantOpenBoletos[0].barCode ? <Check className="w-4 h-4 text-brand-lime" /> : <Copy className="w-4 h-4" />}
                        <span>Copiar Código de Barras</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: PROPRIEDADES ========================== */}
        {/* ==================================================================== */}
        {activeTab === 'propriedades' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-text-primary">
                  Propriedades & Imóveis Cadastrados
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Acompanhe seus imóveis locados, anúncios publicados e o parecer das <strong>avaliações gratuitas</strong>.
                </p>
              </div>

              <Link
                href="/anunciar"
                className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Imóvel para Avaliação</span>
              </Link>
            </div>

            {ownerUnits.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-sm space-y-4 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-surface text-brand-lime flex items-center justify-center mx-auto shadow-inner">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-text-primary">Você ainda não possui imóveis cadastrados</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Comece cadastrando sua propriedade para avaliação gratuita pela equipe i7. Nós cuidamos do anúncio, vistorias, análise de crédito dos inquilinos e repasse pontual dos aluguéis!
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/anunciar"
                    className="px-5 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Meu Primeiro Imóvel</span>
                  </Link>
                  <a
                    href="https://wa.me/5515999990000?text=Ol%C3%A1%2C%20acabei%20de%20me%20cadastrar%20no%20portal%20e%20gostaria%20de%20cadastrar%20meu%20im%C3%B3vel."
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary text-xs font-bold transition-all text-center"
                  >
                    Falar com Consultor
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownerUnits.map(unit => {
                const isPending = unit.status === 'PENDENTE_AVALIACAO';
                const isRejected = unit.status === 'REPROVADO';
                const isAvailable = unit.status === 'DISPONIVEL';

                return (
                  <div 
                    key={unit.id} 
                    className={`p-6 rounded-2xl bg-white border shadow-sm space-y-4 ${
                      isPending ? 'border-2 border-amber-300 bg-amber-50/20' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-brand-lime">{unit.type} • {unit.floor}</span>
                        <h3 className="text-lg font-black text-text-primary mt-0.5">{unit.unitNumber}</h3>
                        <p className="text-xs text-text-secondary">{unit.buildingName}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        unit.status === 'LOCADO'
                          ? 'bg-emerald-100 text-emerald-700'
                          : isAvailable
                          ? 'bg-blue-100 text-blue-700'
                          : isPending
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {isPending ? 'EM AVALIAÇÃO' : isAvailable ? 'ANÚNCIO ATIVO' : unit.status}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Inquilino Atual:</span>
                        <span className="font-bold text-text-primary">{unit.tenantName || 'Sem inquilino (Disponível)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">{isPending ? 'Valor Pretendido:' : 'Aluguel Contratual:'}</span>
                        <span className="font-bold text-text-primary">R$ {unit.rentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Condomínio + IPTU:</span>
                        <span className="font-bold text-text-primary">R$ {(unit.condoValue + unit.iptuValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Feedback do Administrador se houver */}
                    {unit.adminFeedback && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <strong className="block text-emerald-900 font-black">
                          Parecer da Equipe Técnica i7:
                        </strong>
                        <p className="text-emerald-800 leading-relaxed">{unit.adminFeedback}</p>
                      </div>
                    )}

                    {/* Aviso de Aguardando Avaliação */}
                    {isPending && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                        <strong className="block text-amber-900 font-black">
                          Aguardando Parecer do Administrador
                        </strong>
                        <p className="text-amber-800 leading-relaxed">
                          Nossa equipe técnica está analisando a documentação e o valor de mercado. Assim que aprovado pelo painel, o anúncio entrará no ar automaticamente!
                        </p>
                      </div>
                    )}

                    {/* Link para o anúncio no site se estiver aprovado */}
                    {isAvailable && (
                      <Link
                        href="/imoveis"
                        className="w-full py-2.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-brand-lime" />
                        <span>Ver Anúncio Publicado no Site</span>
                      </Link>
                    )}
                  </div>
                );
              })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: CONTRATOS ============================= */}
        {/* ==================================================================== */}
        {(activeTab === 'contratos' || activeTab === 'contrato') && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-text-primary">
              {portalMode === 'OWNER' ? 'Locações Ativas e Encerradas das suas Unidades' : 'Ficha do Meu Contrato de Locação'}
            </h2>

            {portalMode === 'OWNER' ? (
              ownerContracts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-sm space-y-3 max-w-xl mx-auto">
                  <FileText className="w-10 h-10 text-brand-lime mx-auto" />
                  <h3 className="text-base font-black text-text-primary">Nenhum contrato ativo</h3>
                  <p className="text-xs text-text-secondary">
                    Assim que suas propriedades forem alugadas e o contrato for formalizado com o locatário, os termos jurídicos e valores aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Contrato</th>
                        <th className="p-4">Unidade</th>
                        <th className="p-4">Locatário</th>
                        <th className="p-4">Vigência</th>
                        <th className="p-4">Valor Mensal</th>
                        <th className="p-4">Reajuste / Garantia</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ownerContracts.map(c => (
                        <tr key={c.id} className="hover:bg-surface/50">
                          <td className="p-4 font-mono font-bold text-text-primary">{c.code}</td>
                          <td className="p-4 font-bold text-text-primary">{c.unitName}</td>
                          <td className="p-4">{c.tenantName}</td>
                          <td className="p-4">{c.startDate} a {c.endDate}</td>
                          <td className="p-4 font-black text-brand-lime">R$ {c.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="p-4">{c.adjustmentIndex} • {c.guaranteeType.replace('_', ' ')}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // Tenant Contract details
              tenantContract ? (
                <div className="p-8 rounded-2xl bg-white border border-border shadow-sm space-y-6 max-w-3xl">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div>
                      <span className="text-[10px] font-black uppercase text-brand-lime">Contrato Oficial</span>
                      <h3 className="text-xl font-black text-text-primary">{tenantContract.code}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-700">
                      {tenantContract.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                      <span className="text-text-secondary">Unidade Locada:</span>
                      <div className="font-bold text-sm text-text-primary">{tenantContract.unitName}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                      <span className="text-text-secondary">Valor do Aluguel Mensal:</span>
                      <div className="font-bold text-sm text-brand-lime">
                        R$ {tenantContract.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                      <span className="text-text-secondary">Período de Vigência:</span>
                      <div className="font-bold text-sm text-text-primary">{tenantContract.startDate} até {tenantContract.endDate}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                      <span className="text-text-secondary">Índice & Garantia:</span>
                      <div className="font-bold text-sm text-text-primary">{tenantContract.adjustmentIndex} • {tenantContract.guaranteeType}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border text-xs text-text-secondary space-y-1">
                    <div>Multa contratual por atraso: <span className="font-bold text-text-primary">{tenantContract.finePercent}%</span></div>
                    <div>Juros de mora: <span className="font-bold text-text-primary">{tenantContract.interestPercent}% ao mês</span></div>
                    <div>Proprietário locador: <span className="font-bold text-text-primary">{tenantContract.ownerName}</span></div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-sm space-y-4 max-w-xl mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-surface text-brand-lime flex items-center justify-center mx-auto shadow-inner">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-text-primary">Nenhum contrato de locação ativo</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Você ainda não possui um contrato de locação vinculado a esta conta. Encontre seu imóvel ideal ou acompanhe sua proposta de locação!
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/imoveis"
                      className="px-5 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-sm transition-all text-center"
                    >
                      Ver Imóveis Disponíveis
                    </Link>
                    <a
                      href="https://wa.me/5515999990000?text=Ol%C3%A1%2C%20sou%20inquilino%20e%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20meu%20contrato."
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary text-xs font-bold transition-all text-center"
                    >
                      Falar com Atendimento
                    </a>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: BOLETOS =============================== */}
        {/* ==================================================================== */}
        {activeTab === 'boletos' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-text-primary">
              {portalMode === 'OWNER' 
                ? 'Lista Completa de Boletos das suas Unidades (Somente Leitura)' 
                : 'Boletos em Aberto para Pagamento'}
            </h2>

            {portalMode === 'OWNER' ? (
              // Owner: Full list, read-only without action buttons
              ownerBoletos.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-sm space-y-3 max-w-xl mx-auto">
                  <Receipt className="w-10 h-10 text-brand-lime mx-auto" />
                  <h3 className="text-base font-black text-text-primary">Nenhum boleto emitido</h3>
                  <p className="text-xs text-text-secondary">
                    Assim que suas propriedades tiverem faturas de aluguel geradas pelo sistema, você poderá acompanhar os vencimentos e quitações por aqui.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Código</th>
                        <th className="p-4">Unidade / Inquilino</th>
                        <th className="p-4">Valor</th>
                        <th className="p-4">Vencimento</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ownerBoletos.map(b => (
                        <tr key={b.id} className="hover:bg-surface/50">
                          <td className="p-4 font-mono font-bold text-text-primary">{b.code}</td>
                          <td className="p-4">
                            <div className="font-bold text-text-primary">{b.unitName}</div>
                            <div className="text-[11px] text-text-secondary">{b.tenantName}</div>
                          </td>
                          <td className="p-4 font-black text-text-primary">R$ {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="p-4">{b.dueDate}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              b.status === 'PAGO' ? 'bg-emerald-100 text-emerald-700' :
                              b.status === 'VENCIDO' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {b.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // Tenant: Only OPEN or OVERDUE with payment buttons
              <div className="space-y-4">
                {tenantOpenBoletos.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-border shadow-sm space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h3 className="text-base font-bold text-text-primary">Parabéns! Nenhum boleto em aberto.</h3>
                    <p className="text-xs text-text-secondary">Todos os seus pagamentos estão em dia.</p>
                  </div>
                ) : (
                  tenantOpenBoletos.map(b => (
                    <div key={b.id} className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-brand-lime">{b.code}</span>
                          <h3 className="text-lg font-black text-text-primary mt-0.5">{b.unitName}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-text-primary">
                            R$ {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-red-600 font-bold">Vencimento: {b.dueDate}</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-text-secondary">
                          Pague instantaneamente via PIX ou copie a linha digitável do código de barras bancário.
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setViewingBoleto(b)}
                            className="px-3.5 py-2 rounded-xl bg-surface border border-border text-text-primary text-xs font-bold hover:border-brand-lime flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand-lime" />
                            <span>Abrir Boleto</span>
                          </button>

                          <button
                            onClick={() => handlePayBoletoWithPix(b)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 shadow flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pagar com PIX</span>
                          </button>

                          <button
                            onClick={() => handleCopy(b.pixCode)}
                            className="px-4 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow flex items-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{copiedCode === b.pixCode ? 'PIX Copiado!' : 'Copiar PIX'}</span>
                          </button>

                          <button
                            onClick={() => handleCopy(b.barCode)}
                            className="px-4 py-2 rounded-xl bg-white border border-border text-text-primary text-xs font-bold hover:border-brand-lime flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedCode === b.barCode ? 'Copiado!' : 'Código de Barras'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: PAGAMENTOS / EXTRATOS ================= */}
        {/* ==================================================================== */}
        {activeTab === 'pagamentos' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-text-primary">
              {portalMode === 'OWNER' 
                ? 'Extrato por Competência, Despesas e Comprovantes de Repasse' 
                : 'Histórico de Boletos Já Quitados'}
            </h2>

            {portalMode === 'OWNER' ? (
              // Owner statement
              ownerPayments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-sm space-y-3 max-w-xl mx-auto">
                  <DollarSign className="w-10 h-10 text-brand-lime mx-auto" />
                  <h3 className="text-base font-black text-text-primary">Nenhum extrato gerado</h3>
                  <p className="text-xs text-text-secondary">
                    Assim que suas propriedades locadas tiverem os aluguéis quitados pelos locatários, os demonstrativos detalhados de repasse líquido aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ownerPayments.map(p => (
                    <div key={p.id} className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <div>
                          <span className="text-[10px] font-black uppercase text-brand-lime">Competência</span>
                          <h3 className="text-lg font-black text-text-primary">{p.competence} • {p.unitName}</h3>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.status === 'CONCILIADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-surface border border-border">
                          <span className="text-text-secondary block">Aluguel Bruto:</span>
                          <span className="font-bold text-sm text-text-primary">
                            R$ {p.expectedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-surface border border-border">
                          <span className="text-text-secondary block">Taxa Adm i7:</span>
                          <span className="font-bold text-sm text-text-secondary">
                            - R$ {p.adminFeeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-surface border border-border">
                          <span className="text-text-secondary block">Despesas Abatidas:</span>
                          <span className="font-bold text-sm text-red-600">
                            - R$ {p.expensesDeducted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/30">
                          <span className="text-brand-lime font-bold block">Líquido Repassado:</span>
                          <span className="font-black text-base text-brand-lime">
                            R$ {p.transferredAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {p.transferReceiptUrl && (
                        <div className="pt-2 flex justify-end">
                          <a 
                            href={p.transferReceiptUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary hover:border-brand-lime flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-brand-lime" /> Baixar Comprovante de Repasse (PDF)
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Tenant Paid History
              tenantPaidBoletos.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-sm space-y-3 max-w-xl mx-auto">
                  <Receipt className="w-10 h-10 text-brand-lime mx-auto" />
                  <h3 className="text-base font-black text-text-primary">Nenhum pagamento registrado</h3>
                  <p className="text-xs text-text-secondary">
                    Assim que suas faturas de locação forem quitadas via PIX ou código de barras, os comprovantes e baixas financeiras constarão nesta aba.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tenantPaidBoletos.map(b => (
                    <div key={b.id} className="p-5 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-text-primary">{b.unitName}</div>
                        <div className="text-xs text-text-secondary mt-0.5">
                          Quitado em {b.paidAt} • {b.code}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm text-emerald-600">
                          R$ {b.paidAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 justify-end mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Pago com Sucesso
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: REPASSES (PROPRIETÁRIO) =============== */}
        {/* ==================================================================== */}
        {activeTab === 'repasses' && portalMode === 'OWNER' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-text-primary">
              Histórico de Transferências Bancárias / PIX
            </h2>

            {ownerPayments.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-sm space-y-3 max-w-xl mx-auto">
                <ArrowUpRight className="w-10 h-10 text-brand-lime mx-auto" />
                <h3 className="text-base font-black text-text-primary">Nenhum repasse bancário até o momento</h3>
                <p className="text-xs text-text-secondary">
                  Os comprovantes de transferência bancária via PIX dos seus aluguéis serão arquivados aqui automaticamente a cada repasse efetuado.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Data do Repasse</th>
                      <th className="p-4">Competência</th>
                      <th className="p-4">Unidade</th>
                      <th className="p-4">Valor Líquido</th>
                      <th className="p-4">Forma de Envio</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ownerPayments.map(p => (
                      <tr key={p.id} className="hover:bg-surface/50">
                        <td className="p-4 font-bold text-text-primary">{p.transferDate || 'Em processamento'}</td>
                        <td className="p-4">{p.competence}</td>
                        <td className="p-4 font-bold text-text-primary">{p.unitName}</td>
                        <td className="p-4 font-black text-blue-600">
                          R$ {p.transferredAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-text-secondary">Chave PIX (Asaas)</td>
                        <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                          {p.status === 'CONCILIADO' ? 'Transferido' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: MANUTENÇÕES =========================== */}
        {/* ==================================================================== */}
        {activeTab === 'manutencoes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-text-primary">
                {portalMode === 'OWNER' ? 'Status e Orçamento dos Chamados nas suas Unidades' : 'Meus Chamados de Manutenção'}
              </h2>

              {portalMode === 'TENANT' && (
                <button
                  onClick={() => setIsNewTicketModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Abrir Novo Chamado
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(portalMode === 'OWNER' ? ownerMaintenances : tenantMaintenances).map(mnt => (
                <div key={mnt.id} className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-brand-lime">{mnt.category} • Urgência: {mnt.urgency}</span>
                      <h3 className="font-extrabold text-base text-text-primary mt-0.5">{mnt.title}</h3>
                      <p className="text-xs text-text-secondary">{mnt.unitName}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      mnt.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-700' :
                      mnt.status === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-700' :
                      mnt.status === 'EM_ANALISE' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {mnt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed p-3 rounded-xl bg-surface border border-border">
                    {mnt.description}
                  </p>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-text-secondary">
                      Orçamento: <span className="font-bold text-text-primary">
                        {mnt.estimatedCost ? `R$ ${mnt.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Em levantamento'}
                      </span>
                    </span>
                    <span className="text-text-muted text-[11px]">{mnt.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: DOCUMENTOS ============================ */}
        {/* ==================================================================== */}
        {activeTab === 'documentos' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-text-primary">
              {portalMode === 'OWNER' ? 'Arquivos Ligados às suas Propriedades' : 'Documentos Liberados para Você'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(portalMode === 'OWNER' ? ownerDocuments : tenantDocuments).map(doc => (
                <div key={doc.id} className="p-5 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-lime transition-all">
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-brand-lime/10 text-brand-lime">
                      {doc.category}
                    </span>
                    <h3 className="font-bold text-sm text-text-primary">{doc.title}</h3>
                    <p className="text-xs text-text-secondary">{doc.unitName}</p>
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-brand-lime" /> Visualizar Arquivo ({doc.fileSize})
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: COMUNICADOS =========================== */}
        {/* ==================================================================== */}
        {activeTab === 'comunicados' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-text-primary">
              Mural de Comunicados e Avisos Prediais
            </h2>

            <div className="space-y-4">
              {announcements.map(ann => {
                const currentUserId = session?.user?.id || 'curr-user';
                const hasRead = ann.readBy.some(r => r.userId === currentUserId);

                return (
                  <div key={ann.id} className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-brand-lime/10 text-brand-lime">
                        {ann.unitScope}
                      </span>
                      <span className="text-xs text-text-secondary">{ann.createdAt}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-text-primary">{ann.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      {hasRead ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Você confirmou a leitura deste comunicado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConfirmReadAnnouncement(ann.id)}
                          className="px-4 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Leitura
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: RELATÓRIOS (PROPRIETÁRIO) ============= */}
        {/* ==================================================================== */}
        {activeTab === 'relatorios' && portalMode === 'OWNER' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-text-primary">
              Gráfico de Repasses Líquidos por Competência
            </h2>

            <div className="p-8 rounded-2xl bg-white border border-border shadow-sm space-y-6">
              <div className="text-xs text-text-secondary">
                Valores líquidos já deduzidos de comissão de administração e manutenções do mês.
              </div>

              {/* Bar Chart Visualization */}
              <div className="space-y-4">
                {[
                  { month: 'Mai/2026', value: 6850, max: 10000 },
                  { month: 'Jun/2026', value: 7120, max: 10000 },
                  { month: 'Jul/2026', value: 6940, max: 10000 },
                  { month: 'Ago/2026', value: 7120, max: 10000 },
                  { month: 'Set/2026 (Previsto)', value: 7450, max: 10000 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-text-primary">
                      <span>{item.month}</span>
                      <span className="text-brand-lime">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full h-3 bg-surface rounded-full overflow-hidden border border-border">
                      <div 
                        className="h-full bg-brand-lime rounded-full"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* ======================= ABA: PERFIL ================================ */}
        {/* ==================================================================== */}
        {activeTab === 'perfil' && (
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-base font-black text-text-primary">
              Meu Perfil & Segurança
            </h2>

            <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-lime" /> Alterar Senha de Acesso
              </h3>

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Senha atualizada com sucesso!
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Senha Atual</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md transition-all"
                  >
                    Salvar Nova Senha
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Modal Abertura de Chamado pelo Inquilino */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Abrir Chamado de Manutenção</h3>
              <button onClick={() => setIsNewTicketModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenantTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Qual é o problema?</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Torneira da cozinha gotejando"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Categoria</label>
                  <select
                    value={ticketCategory}
                    onChange={(e: any) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="HIDRAULICA">Hidráulica (Vazamentos/Pias)</option>
                    <option value="ELETRICA">Elétrica (Disjuntores/Tomadas)</option>
                    <option value="ESTRUTURAL">Estrutural (Portas/Janelas)</option>
                    <option value="PINTURA">Pintura</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Nível de Urgência</label>
                  <select
                    value={ticketUrgency}
                    onChange={(e: any) => setTicketUrgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="BAIXA">Baixa (Pode aguardar)</option>
                    <option value="MEDIA">Média (Atenção nesta semana)</option>
                    <option value="ALTA">Alta (Urgência)</option>
                    <option value="EMERGENCIA">Emergência Imediata</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Conte com detalhes o que aconteceu e os melhores horários para visita técnica..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ================= MODAL: VISUALIZADOR DE BOLETO BANCÁRIO ============ */}
      {/* ==================================================================== */}
      {viewingBoleto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:p-0 print:border-none print:shadow-none">
            {/* Topo / Barra de Ações (oculta na impressão) */}
            <div className="flex items-center justify-between pb-4 border-b border-border print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-lime" />
                <h3 className="text-base font-black text-text-primary">Boleto de Cobrança Bancária</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-lime" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingBoleto(null)}
                  className="p-1.5 rounded-xl text-text-secondary hover:bg-surface"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Boleto FEBRABAN Oficial */}
            <div className="border-2 border-dashed border-gray-300 p-5 rounded-xl space-y-4 font-sans text-xs text-gray-800 bg-white">
              {/* Recibo do Pagador / Cabeçalho */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg text-emerald-800 tracking-wider">i7 BANCO / ASAAS</span>
                  <span className="font-bold text-sm px-2 border-l-2 border-r-2 border-black">033-7</span>
                </div>
                <div className="font-mono text-xs font-black tracking-wide text-gray-900 break-all text-right">
                  {viewingBoleto.barCode}
                </div>
              </div>

              {/* Grade de Dados Principais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-gray-300 pb-3 text-[11px]">
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Beneficiário</div>
                  <div className="font-bold text-gray-900">i7 Inteligência Imobiliária S.A.</div>
                  <div className="text-[10px] text-gray-500">CNPJ: 45.123.890/0001-99</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Agência / Código Beneficiário</div>
                  <div className="font-bold text-gray-900">0001 / 3bb1823d-asaas</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Vencimento</div>
                  <div className="font-black text-red-600 text-xs">{viewingBoleto.dueDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Valor do Documento</div>
                  <div className="font-black text-gray-900 text-sm">
                    R$ {viewingBoleto.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Dados do Sacado / Inquilino */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] space-y-1">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Pagador (Sacado)</div>
                <div className="font-bold text-gray-900">{viewingBoleto.tenantName}</div>
                <div className="text-gray-600">Unidade: {viewingBoleto.unitName}</div>
                <div className="text-gray-600">Proprietário: {viewingBoleto.ownerName}</div>
              </div>

              {/* Instruções de Pagamento */}
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-[11px] text-gray-700 space-y-1">
                <div className="font-bold text-amber-900">Instruções de Pagamento:</div>
                <p>• Pagável em qualquer banco, casa lotérica ou internet banking até a data de vencimento.</p>
                <p>• Após o vencimento, cobrar multa de 10% e juros de mora de 1% ao mês.</p>
                <p>• Para quitação e baixa imediata em segundos, pague apontando a câmera para o QR Code PIX abaixo.</p>
              </div>

              {/* Bloco PIX & Código de Barras */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200">
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Pague com PIX Copia e Cola:</div>
                  <div className="font-mono text-[10px] text-gray-700 bg-gray-100 p-2 rounded max-w-sm break-all">
                    {viewingBoleto.pixCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(viewingBoleto.pixCode)}
                    className="mt-1 text-[11px] font-bold text-brand-lime hover:underline inline-flex items-center gap-1"
                  >
                    {copiedCode === viewingBoleto.pixCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === viewingBoleto.pixCode ? 'Chave PIX copiada!' : 'Copiar Chave PIX'}</span>
                  </button>
                </div>

                {/* Código de Barras Gráfico Simulado */}
                <div className="text-center">
                  <div className="h-12 w-48 mx-auto flex items-stretch gap-[2px] bg-white p-1">
                    {[3,1,2,4,1,3,2,1,4,2,3,1,2,1,4,2,3,1,2,4,1,3,2,1,3,2,4,1,2].map((w, idx) => (
                      <div key={idx} className="bg-black" style={{ width: `${w * 2}px` }} />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-gray-500 tracking-wider">AUTENTICAÇÃO MECÂNICA</span>
                </div>
              </div>
            </div>

            {/* Ações do Rodapé (ocultas na impressão) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => handleCopy(viewingBoleto.barCode)}
                className="px-4 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary hover:border-brand-lime flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode === viewingBoleto.barCode ? 'Código Copiado!' : 'Copiar Linha Digitável'}</span>
              </button>

              <div className="flex items-center gap-2">
                {viewingBoleto.status === 'EM_ABERTO' && (
                  <button
                    type="button"
                    onClick={() => {
                      const b = viewingBoleto;
                      setViewingBoleto(null);
                      handlePayBoletoWithPix(b);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 shadow flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pagar com PIX (Baixa Imediata)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingBoleto(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
