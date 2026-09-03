'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Shield, 
  ShieldCheck,
  AlertCircle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  MessageSquare, 
  ClipboardCheck, 
  ExternalLink, 
  Eye, 
  User, 
  Phone, 
  CreditCard, 
  ArrowRight, 
  Check, 
  Receipt,
  FileCheck,
  Building2,
  Printer
} from 'lucide-react';
import { 
  GestaoContract, 
  INITIAL_CONTRACTS, 
  BuildingUnit, 
  INITIAL_UNITS, 
  GestaoBoleto, 
  INITIAL_BOLETOS, 
  GestaoUser, 
  INITIAL_USERS, 
  RentalProposal, 
  INITIAL_PROPOSALS, 
  InspectionReport, 
  INITIAL_INSPECTIONS, 
  getStoredData, 
  saveStoredData, 
  logAuditEvent 
} from '@/lib/gestaoData';

export default function ContratosAdminPage() {
  const [contracts, setContracts] = useState<GestaoContract[]>([]);
  const [proposals, setProposals] = useState<RentalProposal[]>([]);
  const [unitsList, setUnitsList] = useState<BuildingUnit[]>([]);
  const [usersList, setUsersList] = useState<GestaoUser[]>([]);
  
  // Abas Principais
  const [mainTab, setMainTab] = useState<'CONTRACTS' | 'PROPOSALS'>('CONTRACTS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureModalContract, setSignatureModalContract] = useState<GestaoContract | null>(null);
  const [viewingContractDraft, setViewingContractDraft] = useState<GestaoContract | null>(null);
  const [successModalData, setSuccessModalData] = useState<{ contract: GestaoContract; proposal: RentalProposal } | null>(null);

  // Form states para novo contrato manual
  const [newCode, setNewCode] = useState(`CTR-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [newUnit, setNewUnit] = useState('Sala 101 - Edifício Paulista Corporate');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [newTenantName, setNewTenantName] = useState('Lucas Mendes Ferreira');
  const [newTenantEmail, setNewTenantEmail] = useState('lucas.mendes@email.com');
  const [newOwnerName, setNewOwnerName] = useState('Eduardo Silveira Ramos');
  const [newOwnerEmail, setNewOwnerEmail] = useState('eduardo.silveira@email.com');
  const [newStartDate, setNewStartDate] = useState('01/09/2026');
  const [newEndDate, setNewEndDate] = useState('31/08/2028');
  const [newAmount, setNewAmount] = useState(4500);
  const [newIndex, setNewIndex] = useState<'IPCA' | 'IGP-M' | 'INPC'>('IPCA');
  const [newGuarantee, setNewGuarantee] = useState<'CAUCAO' | 'SEGURO_FIANCA' | 'FIADOR' | 'TITULO_CAP'>('SEGURO_FIANCA');
  const [newFine, setNewFine] = useState(10);
  const [newInterest, setNewInterest] = useState(1);

  useEffect(() => {
    setContracts(getStoredData('contracts', INITIAL_CONTRACTS));
    setProposals(getStoredData('proposals', INITIAL_PROPOSALS));
    setUnitsList(getStoredData('units', INITIAL_UNITS));
    setUsersList(getStoredData('users', INITIAL_USERS));
  }, []);

  const pendingProposalsCount = proposals.filter(p => p.status === 'EM_ANALISE_CREDITO' || p.status === 'AGUARDANDO_DOCUMENTOS').length;

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unit = unitsList.find(u => u.id === unitId);
    if (unit) {
      setNewUnit(`${unit.unitNumber} - ${unit.buildingName}`);
      setNewOwnerName(unit.ownerName);
      setNewOwnerEmail(unit.ownerEmail);
      setNewAmount(unit.rentValue);
    }
  };

  const handleTenantSelect = (userId: string) => {
    setSelectedTenantId(userId);
    const user = usersList.find(u => u.id === userId);
    if (user) {
      setNewTenantName(user.name);
      setNewTenantEmail(user.email);
    }
  };

  // 1. Criar Contrato Manual
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const newContract: GestaoContract = {
      id: `cnt-${Date.now()}`,
      code: newCode,
      unitName: newUnit,
      tenantName: newTenantName,
      tenantEmail: newTenantEmail,
      ownerName: newOwnerName,
      ownerEmail: newOwnerEmail,
      startDate: newStartDate,
      endDate: newEndDate,
      monthlyAmount: Number(newAmount),
      adjustmentIndex: newIndex,
      guaranteeType: newGuarantee,
      finePercent: Number(newFine),
      interestPercent: Number(newInterest),
      status: 'ATIVO'
    };

    const updatedContracts = [newContract, ...contracts];
    setContracts(updatedContracts);
    saveStoredData('contracts', updatedContracts);

    // Atualiza a unidade para LOCADO
    const units = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    const updatedUnits = units.map(u => {
      if (newUnit.includes(u.unitNumber) || u.buildingName.includes(newUnit.split('-')[0].trim())) {
        return {
          ...u,
          status: 'LOCADO' as const,
          tenantName: newTenantName,
          tenantEmail: newTenantEmail,
          rentValue: Number(newAmount)
        };
      }
      return u;
    });
    saveStoredData('units', updatedUnits);

    setIsModalOpen(false);
    setNewCode(`CTR-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  // 2. ETAPA 3: APROVAR CRÉDITO & EMITIR CONTRATO DIGITAL A PARTIR DA PROPOSTA
  const handleApproveProposalAndEmitContract = (proposal: RentalProposal) => {
    const contractCode = `CTR-2026-${String(contracts.length + 1).padStart(3, '0')}`;
    
    // A. Cria o Contrato Digital Oficial
    const newContract: GestaoContract = {
      id: `cnt-${Date.now()}`,
      code: contractCode,
      unitName: proposal.unitName,
      tenantName: proposal.clientName,
      tenantEmail: proposal.clientEmail,
      ownerName: 'Carlos Alberto Silva',
      ownerEmail: 'proprietario@i7.com.br',
      startDate: new Date().toLocaleDateString('pt-BR'),
      endDate: new Date(Date.now() + 30 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      monthlyAmount: proposal.rentValue,
      adjustmentIndex: 'IPCA',
      guaranteeType: proposal.guaranteeType === 'CAUCAO' ? 'CAUCAO' : 'SEGURO_FIANCA',
      finePercent: 10,
      interestPercent: 1,
      status: 'ATIVO'
    };

    const updatedContracts = [newContract, ...contracts];
    setContracts(updatedContracts);
    saveStoredData('contracts', updatedContracts);

    // B. Atualiza a Proposta para CONTRATO_ASSINADO
    const updatedProposal: RentalProposal = {
      ...proposal,
      status: 'CONTRATO_ASSINADO',
      contractId: newContract.id,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };
    const updatedProposals = proposals.map(p => p.id === proposal.id ? updatedProposal : p);
    setProposals(updatedProposals);
    saveStoredData('proposals', updatedProposals);

    // C. ETAPA 4: Atualiza a Unidade para LOCADO
    const units = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    const updatedUnits = units.map(u => {
      if (proposal.unitName.includes(u.unitNumber) || u.buildingName.includes(proposal.unitName)) {
        return {
          ...u,
          status: 'LOCADO' as const,
          tenantName: proposal.clientName,
          tenantEmail: proposal.clientEmail,
          tenantPhone: proposal.clientPhone
        };
      }
      return u;
    });
    setUnitsList(updatedUnits);
    saveStoredData('units', updatedUnits);

    // D. ETAPA 4: Cria automaticamente a Vistoria de Entrada (Check-in) em Vistorias
    const inspections = getStoredData<InspectionReport[]>('inspections', INITIAL_INSPECTIONS);
    const newInspection: InspectionReport = {
      id: `vis-${Date.now()}`,
      code: `VIS-2026-${String(inspections.length + 1).padStart(3, '0')}`,
      propertyId: proposal.propertyId,
      unitName: proposal.unitName,
      propertyAddress: proposal.propertyAddress,
      type: 'ENTRADA',
      status: 'AGUARDANDO_ASSINATURAS',
      inspectorName: 'Marcio Silva (Vistoriador i7)',
      inspectorCreci: 'CRECI 198244-F',
      tenantName: proposal.clientName,
      tenantEmail: proposal.clientEmail,
      tenantPhone: proposal.clientPhone,
      ownerName: 'Carlos Alberto Silva',
      ownerEmail: 'proprietario@i7.com.br',
      inspectionDate: new Date().toLocaleString('pt-BR'),
      meters: {
        waterReading: '150,2 m³',
        waterMeterNumber: 'HID-88491',
        electricReading: '5.240 kWh',
        electricMeterNumber: 'CPFL-091992',
        gasReading: '68,4 m³',
        keysHandedCount: 3,
        remoteControlsCount: 2,
        accessTagsCount: 2,
        keysDescription: '2 chaves da porta principal, 1 chave da caixa de correio e 2 tags de acesso.'
      },
      rooms: [
        {
          id: 'r-auto-1',
          name: 'Sala & Living',
          items: [
            {
              id: 'i-auto-1',
              name: 'Paredes & Pintura',
              condition: 'NOVO',
              notes: 'Pintura nova sem avarias.',
              photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']
            }
          ]
        },
        {
          id: 'r-auto-2',
          name: 'Cozinha',
          items: [
            {
              id: 'i-auto-2',
              name: 'Bancada & Torneiras',
              condition: 'BOM',
              notes: 'Instalações hidráulicas testadas 100%.',
              photos: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800']
            }
          ]
        }
      ],
      generalNotes: 'Vistoria de entrada gerada automaticamente pela esteira de locação digital i7.',
      signedByInspectorAt: new Date().toLocaleString('pt-BR'),
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    saveStoredData('inspections', [newInspection, ...inspections]);

    // E. ETAPA 4: Cria automaticamente o 1º Boleto no Asaas
    const boletos = getStoredData<GestaoBoleto[]>('boletos', INITIAL_BOLETOS);
    const newBoleto: GestaoBoleto = {
      id: `bol-${Date.now()}`,
      code: `BOL-${Math.floor(1000 + Math.random() * 9000)}`,
      unitName: proposal.unitName,
      tenantName: proposal.clientName,
      ownerName: 'Carlos Alberto Silva',
      amount: proposal.totalMonthly,
      dueDate: '10/10/2026',
      status: 'EM_ABERTO',
      dunningStep: 'LEMBRETE_PREVIO',
      barCode: `34191.79001 01043.510047 91020.150008 5 ${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
      pixCode: `00020126580014br.gov.bcb.pix0136i7-asaas-${Date.now()}`
    };
    saveStoredData('boletos', [newBoleto, ...boletos]);

    logAuditEvent(
      'CONTRATO_FECHADO_DIGITALMENTE',
      'Contratos de Locação',
      `Contrato "${contractCode}" fechado digitalmente para ${proposal.clientName}. Vistoria e 1º boleto gerados automaticamente.`,
      proposal.clientEmail
    );

    setSuccessModalData({ contract: newContract, proposal: updatedProposal });
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header com Ações */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Contratos & Esteira Digital</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Gestão de contratos vigentes, análise de crédito, esteira de fechamento digital e assinaturas eletrônicas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary text-xs font-black shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brand-lime" />
            <span>Novo Contrato Manual</span>
          </button>
        </div>
      </div>

      {/* Alternador de Abas Principais: Contratos Ativos vs Propostas de Locação */}
      <div className="flex bg-surface p-1 rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => setMainTab('CONTRACTS')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'CONTRACTS'
              ? 'bg-brand-lime text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contratos de Locação Ativos ({contracts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('PROPOSALS')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            mainTab === 'PROPOSALS'
              ? 'bg-brand-lime text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Propostas & Análise de Crédito</span>
          {pendingProposalsCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              mainTab === 'PROPOSALS' ? 'bg-white text-brand-lime' : 'bg-amber-500 text-white animate-pulse'
            }`}>
              {pendingProposalsCount}
            </span>
          )}
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: CONTRATOS ATIVOS */}
      {mainTab === 'CONTRACTS' && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Contratos Ativos</div>
              <div className="text-2xl font-black text-brand-lime">
                {contracts.filter(c => c.status === 'ATIVO').length}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">Garantindo receita recorrente</div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Renovação Pendente</div>
              <div className="text-2xl font-black text-amber-500">
                {contracts.filter(c => c.status === 'RENOVAÇÃO_PENDENTE').length}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">Vencendo nos próximos 60 dias</div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Garantia Mais Utilizada</div>
              <div className="text-2xl font-black text-text-primary">
                Fiança Digital / Seguro
              </div>
              <div className="text-[11px] text-text-secondary mt-1">Zero inadimplência repassada</div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código CTR, unidade, inquilino ou proprietário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-text-secondary" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
              >
                <option value="ALL">Todos os Status</option>
                <option value="ATIVO">Ativos</option>
                <option value="RENOVAÇÃO_PENDENTE">Renovação Pendente</option>
                <option value="ENCERRADO">Encerrados</option>
              </select>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Contrato</th>
                  <th className="p-4">Unidade / Imóvel</th>
                  <th className="p-4">Inquilino</th>
                  <th className="p-4">Proprietário</th>
                  <th className="p-4">Vigência</th>
                  <th className="p-4">Aluguel Mensal</th>
                  <th className="p-4">Reajuste / Garantia</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredContracts.map((cnt) => (
                  <tr key={cnt.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-text-primary">
                      {cnt.code}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-text-primary">{cnt.unitName}</div>
                      <div className="text-[11px] text-text-secondary">Sorocaba - SP</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-text-primary">{cnt.tenantName}</div>
                      <div className="text-[11px] text-text-secondary">{cnt.tenantEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-text-primary">{cnt.ownerName}</div>
                      <div className="text-[11px] text-text-secondary">{cnt.ownerEmail}</div>
                    </td>
                    <td className="p-4">
                      <div>{cnt.startDate}</div>
                      <div className="text-[11px] text-text-secondary">até {cnt.endDate}</div>
                    </td>
                    <td className="p-4 font-black text-brand-lime">
                      R$ {cnt.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 space-x-1">
                      <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-text-secondary">
                        {cnt.adjustmentIndex}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-text-secondary">
                        {cnt.guaranteeType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        cnt.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' :
                        cnt.status === 'RENOVAÇÃO_PENDENTE' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {cnt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/assinar/${cnt.id}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-xl bg-lime-50 border border-brand-lime/30 text-lime-900 hover:bg-brand-lime hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                        title="Abrir tela de assinatura digital no celular com desenho touch e token"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-lime" />
                        <span>Assinar no Celular</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setViewingContractDraft(cnt)}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Visualizar minuta jurídica completa e imprimir contrato oficial"
                      >
                        <FileText className="w-3.5 h-3.5 text-brand-lime" />
                        <span>Minuta / PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignatureModalContract(cnt)}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Ver assinaturas eletrônicas e validade jurídica"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-brand-lime" />
                        <span>Assinaturas</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: PROPOSTAS DE LOCAÇÃO & ANÁLISE DE CRÉDITO */}
      {mainTab === 'PROPOSALS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-lime-50 border border-brand-lime/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-lime text-white flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-lime-950">Esteira de Aprovação de Crédito</h3>
                <p className="text-xs text-lime-900 mt-0.5">
                  Propostas geradas a partir das visitas presenciais. Analise a renda, aprove o crédito e o contrato digital será emitido instantaneamente!
                </p>
              </div>
            </div>
            <Link
              href="/painel/visitas"
              className="px-4 py-2 rounded-xl bg-white border border-brand-lime/30 text-lime-900 text-xs font-bold hover:bg-lime-100 shrink-0 transition-colors"
            >
              Ver Visitas Agendadas
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposals.map(proposal => {
              const isApproved = proposal.status === 'CONTRATO_ASSINADO' || proposal.status === 'APROVADA';
              const isUnderAnalysis = proposal.status === 'EM_ANALISE_CREDITO';

              return (
                <div 
                  key={proposal.id}
                  className="p-6 rounded-3xl bg-white border border-border hover:border-brand-lime shadow-sm transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header do Card */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-brand-lime bg-surface px-2 py-0.5 rounded border border-border">
                        {proposal.code}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isApproved ? 'bg-emerald-100 text-emerald-700' :
                        isUnderAnalysis ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {proposal.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-text-primary">{proposal.unitName}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{proposal.propertyAddress}</p>
                    </div>

                    {/* Resumo Financeiro & Garantia */}
                    <div className="p-3.5 rounded-2xl bg-surface border border-border grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-secondary block text-[10px] uppercase font-bold">Pacote de Aluguel</span>
                        <span className="font-black text-sm text-brand-lime">
                          R$ {proposal.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary block text-[10px] uppercase font-bold">Garantia Escolhida</span>
                        <span className="font-extrabold text-text-primary">
                          {proposal.guaranteeType === 'FIANCA_DIGITAL' ? '🛡️ Fiança Digital i7' : '🏦 Caução (3 meses)'}
                        </span>
                      </div>
                    </div>

                    {/* Dados do Locatário & Análise de Renda */}
                    <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary font-bold">Locatário:</span>
                        <span className="font-extrabold text-text-primary">{proposal.clientName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary font-bold">CPF & Contato:</span>
                        <span className="font-bold text-text-primary">{proposal.clientCpf || '341.892.418-09'} • {proposal.clientPhone}</span>
                      </div>
                      {proposal.clientIncome && (
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary font-bold">Renda Comprovada:</span>
                          <span className="font-extrabold text-emerald-600">
                            R$ {proposal.clientIncome.toLocaleString('pt-BR')} ({(proposal.clientIncome / proposal.totalMonthly).toFixed(1)}x o pacote total)
                          </span>
                        </div>
                      )}
                      
                      {/* Motor de Análise de Risco Gratuito i7 (Regra dos 3x) */}
                      <div className="p-2.5 rounded-xl bg-white border border-border space-y-1 mt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-text-primary font-bold">Diagnóstico de Capacidade Financeira:</strong>
                          <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                            (proposal.clientIncome || 0) >= proposal.totalMonthly * 3
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {(proposal.clientIncome || 0) >= proposal.totalMonthly * 3 ? '🟢 Risco Baixíssimo (Renda > 3x)' : '🟡 Risco Moderado (Exigir Caução)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-tight">
                          {(proposal.clientIncome || 0) >= proposal.totalMonthly * 3 
                            ? 'O candidato compromete menos de 30% da sua renda com a locação. Perfil ideal para locação digital.' 
                            : 'O candidato compromete mais de 33% da renda. Recomendado compor renda ou exigir caução.'}
                        </p>
                      </div>

                      {/* CONSULTAS PÚBLICAS GRATUITAS (CUSTO R$ 0,00) */}
                      <div className="pt-2 border-t border-border space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-text-secondary block">
                          Consultas Públicas Oficiais Gratuitas (Custo R$ 0,00):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                          <a
                            href="https://site.cenprot.org.br/"
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white border border-border hover:border-brand-lime text-text-primary text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors text-center"
                            title="Consultar se o CPF possui protestos em cartórios do Brasil (100% gratuito)"
                          >
                            <ExternalLink className="w-3 h-3 text-brand-lime shrink-0" />
                            <span>Protestos (CENPROT)</span>
                          </a>

                          <a
                            href="https://esaj.tjsp.jus.br/sco/abrirCadastro.do"
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white border border-border hover:border-brand-lime text-text-primary text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors text-center"
                            title="Certidão gratuita de processos cíveis e ações de despejo no TJSP"
                          >
                            <ExternalLink className="w-3 h-3 text-brand-lime shrink-0" />
                            <span>Despejo (TJSP)</span>
                          </a>

                          <a
                            href="https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp"
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white border border-border hover:border-brand-lime text-text-primary text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors text-center"
                            title="Consulta gratuita de regularidade cadastral do CPF na Receita Federal"
                          >
                            <ExternalLink className="w-3 h-3 text-brand-lime shrink-0" />
                            <span>CPF (Receita)</span>
                          </a>
                        </div>
                      </div>

                    </div>

                    {/* Documentos Anexados */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-text-secondary block mb-1.5">
                        Documentos Anexados pelo Cliente ({proposal.documents.length}):
                      </span>
                      {proposal.documents.length === 0 ? (
                        <div className="p-2.5 rounded-xl bg-surface border border-dashed border-border text-[11px] text-text-secondary text-center">
                          Aguardando cliente anexar documentos pelo link do WhatsApp
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {proposal.documents.map((doc, dIdx) => (
                            <div key={dIdx} className="p-2 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                              <span className="font-bold text-text-primary truncate">{doc.name}</span>
                              <span className="text-[10px] text-brand-lime font-black shrink-0">✓ Validado</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Ações da Proposta */}
                  <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/55${proposal.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá, ${proposal.clientName}! Aqui é da i7 Imobiliária sobre a sua proposta de locação para o imóvel "${proposal.unitName}".`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {!isApproved ? (
                      <button
                        type="button"
                        onClick={() => handleApproveProposalAndEmitContract(proposal)}
                        className="flex-1 px-4 py-2 rounded-xl bg-brand-lime hover:bg-brand-lime-hover text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aprovar & Emitir Contrato Digital</span>
                      </button>
                    ) : (
                      <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Contrato Emitido & Chaves Liberadas</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO: ETAPA 3 & 4 CONCLUÍDAS */}
      {successModalData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full p-8 shadow-2xl space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-brand-lime tracking-wider">Fechamento Concluído</span>
              <h3 className="text-xl font-black text-text-primary mt-1">Aluguel Fechado 100% Digital!</h3>
              <p className="text-xs text-text-secondary mt-1">
                O contrato <strong>{successModalData.contract.code}</strong> foi gerado e as etapas finais foram disparadas automaticamente.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Contrato Digital gerado e pronto para assinatura eletrônica</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Laudo de Vistoria de Entrada criado em /painel/vistorias</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>1º Boleto emitido com sucesso em /painel/boletos</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Unidade alterada para 'LOCADO'</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`https://wa.me/55${successModalData.proposal.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Parabéns, ${successModalData.proposal.clientName}! 🎉\n\nSua análise de crédito foi APROVADA com sucesso pela i7 Imobiliária!\n\nSeu contrato digital (${successModalData.contract.code}) já está pronto para assinatura eletrônica pelo celular.\n\nAlém disso, o laudo de vistoria de entrada e a autorização de retirada das chaves foram emitidos. Seja muito bem-vindo ao seu novo imóvel!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Boas-Vindas & Contrato no WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setSuccessModalData(null)}
                className="w-full py-2.5 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover cursor-pointer"
              >
                Concluir e Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ASSINATURA ELETRÔNICA DO CONTRATO */}
      {signatureModalContract && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="font-mono text-xs font-black text-brand-lime">{signatureModalContract.code}</span>
                <h3 className="text-lg font-black text-text-primary mt-0.5">Assinaturas Eletrônicas do Contrato</h3>
              </div>
              <button onClick={() => setSignatureModalContract(null)} className="p-1 rounded-xl text-text-secondary hover:bg-surface cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Contrato assinado eletronicamente com validade jurídica plena nos termos da <strong>Lei Federal 14.063/20</strong> e <strong>MP 2.200-2/01</strong>.
            </p>

            <div className="space-y-3">
              {/* Locatário */}
              <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-text-primary">{signatureModalContract.tenantName}</strong>
                  <span className="text-[10px] text-text-secondary">Locatário (Inquilino) • {signatureModalContract.tenantEmail}</span>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Assinado
                </span>
              </div>

              {/* Locador */}
              <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-text-primary">{signatureModalContract.ownerName}</strong>
                  <span className="text-[10px] text-text-secondary">Locador (Proprietário) • {signatureModalContract.ownerEmail}</span>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Assinado
                </span>
              </div>

              {/* Imobiliária */}
              <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-text-primary">i7 Gestão Imobiliária Ltda</strong>
                  <span className="text-[10px] text-text-secondary">Administradora Interveniente • CRECI 39.481-J</span>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Homologado
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-border">
              <button
                type="button"
                onClick={() => setSignatureModalContract(null)}
                className="px-5 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Contrato Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Cadastrar Novo Contrato Manual</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Código do Contrato</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Valor do Aluguel (R$)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Selecionar Unidade Cadastrada</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => handleUnitSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                >
                  <option value="">-- Selecione uma unidade ou digite abaixo --</option>
                  {unitsList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber} - {u.buildingName} ({u.status} • R$ {u.rentValue.toLocaleString('pt-BR')})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ou nome personalizado da unidade"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Inquilino (Locatário)</label>
                  <input
                    type="text"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">E-mail do Inquilino</label>
                  <input
                    type="email"
                    value={newTenantEmail}
                    onChange={(e) => setNewTenantEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Proprietário (Locador)</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">E-mail do Proprietário</label>
                  <input
                    type="email"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Índice Reajuste</label>
                  <select
                    value={newIndex}
                    onChange={(e: any) => setNewIndex(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="IPCA">IPCA (Recomendado)</option>
                    <option value="IGP-M">IGP-M</option>
                    <option value="INPC">INPC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Garantia</label>
                  <select
                    value={newGuarantee}
                    onChange={(e: any) => setNewGuarantee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="SEGURO_FIANCA">Fiança Digital / Seguro</option>
                    <option value="CAUCAO">Caução</option>
                    <option value="FIADOR">Fiador Tradicional</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface text-text-secondary text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black shadow-sm hover:bg-brand-lime-hover"
                >
                  Salvar e Ativar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO E IMPRESSÃO DA MINUTA JURÍDICA COMPLETA DO CONTRATO */}
      {viewingContractDraft && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl space-y-6 my-8 max-h-[95vh] overflow-y-auto print:m-0 print:p-0 print:shadow-none">
            
            {/* Barra de Ações (oculta na impressão) */}
            <div className="flex items-center justify-between pb-4 border-b border-border print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-lime" />
                <span className="text-sm font-black text-text-primary">Instrumento Particular de Contrato de Locação ({viewingContractDraft.code})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar em PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingContractDraft(null)}
                  className="p-1.5 rounded-xl text-text-secondary hover:bg-surface cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENTO JURÍDICO FORMAL DO CONTRATO DE LOCAÇÃO */}
            <div className="space-y-6 text-gray-900 font-sans leading-relaxed text-xs">
              
              {/* Cabeçalho Oficial */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-gray-900">
                <div>
                  <div className="text-2xl font-black tracking-tight text-gray-950">i7 GESTÃO IMOBILIÁRIA</div>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Sede Corporativa: R. Cel. Nogueira Padilha, 374 - Vila Hortência, Sorocaba - SP | CRECI 39.481-J
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Contrato Oficial</div>
                  <div className="text-base font-black text-gray-900">{viewingContractDraft.code}</div>
                  <div className="text-[10px] text-gray-500">Data: {viewingContractDraft.startDate}</div>
                </div>
              </div>

              <div className="text-center py-2.5 bg-gray-100 rounded-lg">
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                  INSTRUMENTO PARTICULAR DE CONTRATO DE LOCAÇÃO DE IMÓVEL
                </h2>
                <span className="text-[10px] text-gray-600 font-medium">Regido pela Lei Federal nº 8.245/1991 (Lei do Inquilinato)</span>
              </div>

              {/* Qualificação das Partes */}
              <div className="border p-4 rounded-xl bg-gray-50/60 space-y-2">
                <h3 className="font-black text-gray-900 uppercase text-[11px] border-b pb-1">DAS PARTES CONTRATANTES</h3>
                <div className="space-y-1.5">
                  <p>
                    <strong>LOCADOR(A):</strong> {viewingContractDraft.ownerName}, brasileiro(a), proprietário(a), e-mail de contato: {viewingContractDraft.ownerEmail}, neste ato representado(a) por sua administradora legalmente constituída.
                  </p>
                  <p>
                    <strong>LOCATÁRIO(A):</strong> {viewingContractDraft.tenantName}, brasileiro(a), e-mail: {viewingContractDraft.tenantEmail}, doravante denominado simplesmente LOCATÁRIO.
                  </p>
                  <p>
                    <strong>ADMINISTRADORA & INTERVENIENTE:</strong> i7 GESTÃO IMOBILIÁRIA LTDA, inscrita no CRECI sob o nº 39.481-J, com sede na Rua Cel. Nogueira Padilha, 374, Vila Hortência, Sorocaba - SP.
                  </p>
                </div>
              </div>

              {/* Cláusulas do Contrato */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA PRIMEIRA – DO OBJETO E DESTINAÇÃO</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    O presente instrumento tem por objeto a locação do imóvel localizado na unidade <strong>{viewingContractDraft.unitName}</strong>, em Sorocaba - SP, destinando-se exclusivamente para fins residenciais e comerciais lícitos, não podendo ser sublocado, cedido ou emprestado no todo ou em parte sem prévia anuência por escrito da Administradora.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA SEGUNDA – DO PRAZO E VIGÊNCIA</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    O prazo de locação é de 30 (trinta) meses, iniciando-se em <strong>{viewingContractDraft.startDate}</strong> e com término previsto para <strong>{viewingContractDraft.endDate}</strong>, data em que o LOCATÁRIO se obriga a restituir o imóvel inteiramente desocupado e nas mesmas condições em que o recebeu.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA TERCEIRA – DO VALOR DO ALUGUEL E ENCARGOS</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    O aluguel mensal ajustado é de <strong>R$ {viewingContractDraft.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, a ser pago pontualmente até o dia 10 (dez) de cada mês subsequente ao vencido, através de boleto bancário ou Pix emitido pela Administradora i7. Além do aluguel, correrão por conta exclusiva do LOCATÁRIO as taxas ordinárias de condomínio, IPTU proporcional e consumos de água, energia elétrica e gás.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA QUARTA – DO REAJUSTE ANUAL</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    O valor do aluguel será reajustado anualmente a cada 12 (doze) meses de vigência com base na variação positiva acumulada do índice <strong>{viewingContractDraft.adjustmentIndex}</strong> (ou pelo IPCA, caso aquele venha a ser extinto), conforme a legislação federal vigente.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA QUINTA – DA MORA E PENALIDADES</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    O não pagamento do aluguel e encargos até a data de vencimento implicará em multa moratória de <strong>{viewingContractDraft.finePercent}%</strong> sobre o montante devido, acrescido de juros de mora de <strong>{viewingContractDraft.interestPercent}% ao mês</strong> e atualização monetária diária até a data da efetiva liquidação.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA SEXTA – DA GARANTIA LOCATÍCIA</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    Para garantia do cumprimento de todas as obrigações assumidas neste contrato, as partes optaram pela modalidade de <strong>{viewingContractDraft.guaranteeType.replace('_', ' ')}</strong>, aceita expressamente pelo LOCADOR.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA SÉTIMA – DO LAUDO DE VISTORIA</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    O estado de conservação do imóvel e seus pertences, bem como a leitura dos medidores de água e luz no ato da entrega de chaves, constam expressamente do <strong>Laudo Pericial de Vistoria de Entrada Digital</strong> emitido pela Administradora i7, que passa a fazer parte integrante e inseparável deste contrato.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA OITAVA – DA RESCISÃO ANTECIPADA</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    Na hipótese de desocupação e rescisão contratual anterior ao prazo ajustado, o LOCATÁRIO pagará ao LOCADOR a multa compensatória correspondente a 3 (três) meses de aluguel, calculada sempre de forma proporcional ao tempo restante de contrato, nos termos do Art. 4º da Lei Federal nº 8.245/1991.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-950">CLÁUSULA NONA – DO FORO DE ELEIÇÃO</h4>
                  <p className="text-gray-700 text-justify mt-0.5">
                    Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o Foro da <strong>Comarca de Sorocaba, Estado de São Paulo</strong>, com expressa renúncia a qualquer outro, por mais privilegiado que seja.
                  </p>
                </div>
              </div>

              {/* Termo de Assinatura Eletrônica */}
              <div className="pt-6 border-t-2 border-gray-900 space-y-5">
                <p className="text-[11px] text-gray-600 text-justify leading-relaxed">
                  As partes reconhecem a validade jurídica do presente contrato assinado eletronicamente por meio de certificados e tokens digitais com carimbo de data, hora e endereço IP, em total conformidade com a MP nº 2.200-2/2001 e com a Lei Federal nº 14.063/2020.
                </p>

                <div className="grid grid-cols-3 gap-6 text-center text-xs pt-4">
                  <div className="border-t border-gray-400 pt-2">
                    <strong className="block text-gray-900">{viewingContractDraft.ownerName}</strong>
                    <span className="text-[10px] text-gray-600 block">Locador (Proprietário)</span>
                    <span className="text-[9px] text-emerald-700 font-bold block mt-1">Assinatura Eletrônica Homologada</span>
                  </div>

                  <div className="border-t border-gray-400 pt-2">
                    <strong className="block text-gray-900">{viewingContractDraft.tenantName}</strong>
                    <span className="text-[10px] text-gray-600 block">Locatário (Inquilino)</span>
                    <span className="text-[9px] text-emerald-700 font-bold block mt-1">Assinatura Eletrônica Homologada</span>
                  </div>

                  <div className="border-t border-gray-400 pt-2">
                    <strong className="block text-gray-900">i7 Gestão Imobiliária Ltda</strong>
                    <span className="text-[10px] text-gray-600 block">CRECI 39.481-J (Administradora)</span>
                    <span className="text-[9px] text-emerald-700 font-bold block mt-1">Certificação ICP-Brasil</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
