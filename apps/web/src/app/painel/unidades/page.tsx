'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Home, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  X, 
  Clock, 
  Check, 
  Eye, 
  Send, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Sparkles,
  ExternalLink,
  MessageSquare,
  Pause,
  Play,
  Trash2,
  EyeOff
} from 'lucide-react';
import { BuildingUnit, INITIAL_UNITS, getStoredData, saveStoredData, logAuditEvent } from '@/lib/gestaoData';
import Link from 'next/link';

export default function UnidadesPage() {
  const [units, setUnits] = useState<BuildingUnit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'AVAILABLE' | 'PAUSED' | 'RENTED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal de Avaliação & Parecer do Administrador
  const [evaluatingUnit, setEvaluatingUnit] = useState<BuildingUnit | null>(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [adjustedRent, setAdjustedRent] = useState<number>(0);
  const [adjustedCondo, setAdjustedCondo] = useState<number>(0);
  const [adjustedIptu, setAdjustedIptu] = useState<number>(0);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Form state for new unit / building
  const [isNewBuildingMode, setIsNewBuildingMode] = useState(false);
  const [customBuildingName, setCustomBuildingName] = useState('');
  const [buildingAddress, setBuildingAddress] = useState('');
  const [buildingNeighborhood, setBuildingNeighborhood] = useState('Parque Campolim');
  const [buildingCity, setBuildingCity] = useState('Sorocaba');

  const [newBuilding, setNewBuilding] = useState('Residencial Parque Campolim');
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newType, setNewType] = useState<'SALA' | 'APARTAMENTO' | 'STUDIO' | 'LOJA' | 'CASA'>('APARTAMENTO');
  const [newFloor, setNewFloor] = useState('');
  const [newArea, setNewArea] = useState(70);
  const [newRent, setNewRent] = useState(3800);
  const [newCondo, setNewCondo] = useState(650);
  const [newIptu, setNewIptu] = useState(180);
  const [newOwnerName, setNewOwnerName] = useState('Carlos Alberto Silva');
  const [newOwnerEmail, setNewOwnerEmail] = useState('proprietario@i7.com.br');
  const [newOwnerPhone, setNewOwnerPhone] = useState('(15) 99123-4567');

  useEffect(() => {
    setUnits(getStoredData('units', INITIAL_UNITS));
  }, []);

  const pendingEvaluations = units.filter(u => u.status === 'PENDENTE_AVALIACAO');

  // Prédios únicos existentes
  const existingBuildings = Array.from(new Set([
    ...units.map(u => u.buildingName),
    'Residencial Parque Campolim',
    'Edifício Vila Hortência Corporate',
    'Condomínio Altos do Campolim',
    'Edifício Sorocaba Prime'
  ])).filter(Boolean);

  const handleOpenEvaluation = (unit: BuildingUnit) => {
    setEvaluatingUnit(unit);
    setAdjustedRent(unit.rentValue);
    setAdjustedCondo(unit.condoValue);
    setAdjustedIptu(unit.iptuValue);
    setAdminFeedback(unit.adminFeedback || '');
  };

  // Aprovar e Publicar Anúncio no Site
  const handleApproveAndPublish = (unit: BuildingUnit) => {
    const updated = units.map(u => {
      if (u.id === unit.id) {
        return {
          ...u,
          status: 'DISPONIVEL' as const,
          rentValue: adjustedRent > 0 ? adjustedRent : u.rentValue,
          condoValue: adjustedCondo >= 0 ? adjustedCondo : u.condoValue,
          iptuValue: adjustedIptu >= 0 ? adjustedIptu : u.iptuValue,
          adminFeedback: adminFeedback || 'Imóvel avaliado e aprovado pela equipe técnica i7 para locação.',
          evaluationDate: new Date().toLocaleDateString('pt-BR')
        };
      }
      return u;
    });

    setUnits(updated);
    saveStoredData('units', updated);

    logAuditEvent(
      'AVALIACAO_APROVADA_E_PUBLICADA',
      'Avaliação de Imóveis',
      `Imóvel "${unit.unitNumber} - ${unit.buildingName}" aprovado pelo admin e publicado no site com aluguel de R$ ${adjustedRent}`,
      unit.ownerEmail
    );

    setEvaluatingUnit(null);
  };

  // Recusar ou Solicitar Ajustes
  const handleRejectOrRequestChanges = (unit: BuildingUnit) => {
    const updated = units.map(u => {
      if (u.id === unit.id) {
        return {
          ...u,
          status: 'REPROVADO' as const,
          adminFeedback: adminFeedback || 'Necessário revisar fotos ou documentação do imóvel.',
          evaluationDate: new Date().toLocaleDateString('pt-BR')
        };
      }
      return u;
    });

    setUnits(updated);
    saveStoredData('units', updated);

    logAuditEvent(
      'AVALIACAO_AJUSTES_SOLICITADOS',
      'Avaliação de Imóveis',
      `Ajustes solicitados para o imóvel "${unit.unitNumber}". Parecer: "${adminFeedback}"`,
      unit.ownerEmail
    );

    setEvaluatingUnit(null);
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitNumber) return;

    const finalBuildingName = isNewBuildingMode ? customBuildingName.trim() : newBuilding;
    if (!finalBuildingName) {
      alert('Por favor, informe o nome do prédio ou condomínio.');
      return;
    }

    const newUnit: BuildingUnit = {
      id: `u-${Date.now()}`,
      buildingName: finalBuildingName,
      unitNumber: newUnitNumber,
      type: newType,
      floor: newFloor || '1º Andar',
      areaSqm: Number(newArea),
      rentValue: Number(newRent),
      condoValue: Number(newCondo),
      iptuValue: Number(newIptu),
      status: 'DISPONIVEL',
      ownerName: newOwnerName,
      ownerEmail: newOwnerEmail,
      ownerPhone: newOwnerPhone,
      street: buildingAddress || finalBuildingName,
      neighborhood: buildingNeighborhood || 'Vila Hortência',
      city: buildingCity || 'Sorocaba',
      state: 'SP'
    };

    const updated = [newUnit, ...units];
    setUnits(updated);
    saveStoredData('units', updated);

    logAuditEvent(
      isNewBuildingMode ? 'NOVO_PREDIO_E_UNIDADE_CADASTRADO' : 'NOVA_UNIDADE_CADASTRADA',
      'Gestão de Unidades',
      `Prédio/Unidade "${finalBuildingName} - ${newUnitNumber}" cadastrado com sucesso pelo administrador.`,
      newOwnerEmail
    );

    setIsModalOpen(false);
    setNewUnitNumber('');
    setCustomBuildingName('');
    setBuildingAddress('');
  };

  // Pausar / Reativar Anúncio no Site
  const handleTogglePause = (unit: BuildingUnit) => {
    const isCurrentlyPaused = unit.status === 'PAUSADO';
    const newStatus = isCurrentlyPaused ? 'DISPONIVEL' : 'PAUSADO';

    const updated = units.map(u => {
      if (u.id === unit.id) {
        return {
          ...u,
          status: newStatus as any
        };
      }
      return u;
    });

    setUnits(updated);
    saveStoredData('units', updated);

    logAuditEvent(
      isCurrentlyPaused ? 'ANUNCIO_REATIVADO' : 'ANUNCIO_PAUSADO',
      'Gestão de Unidades',
      `O anúncio "${unit.unitNumber} - ${unit.buildingName}" foi ${isCurrentlyPaused ? 'reativado e já está visível no site' : 'pausado e ocultado do site'}.`,
      unit.ownerEmail
    );
  };

  // Excluir Anúncio Definitivamente
  const handleDeleteUnit = (unit: BuildingUnit) => {
    const confirmDelete = window.confirm(
      `Deseja realmente excluir o anúncio "${unit.unitNumber} (${unit.buildingName})"?\n\nEsta ação removerá o imóvel definitivamente do painel e do site.`
    );
    if (!confirmDelete) return;

    const updated = units.filter(u => u.id !== unit.id);
    setUnits(updated);
    saveStoredData('units', updated);

    logAuditEvent(
      'ANUNCIO_EXCLUIDO',
      'Gestão de Unidades',
      `O anúncio "${unit.unitNumber} - ${unit.buildingName}" foi excluído definitivamente pelo administrador.`,
      unit.ownerEmail
    );
  };

  const filteredUnits = units.filter(u => {
    const matchesSearch = 
      u.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.tenantName && u.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesTab = true;
    if (activeTab === 'PENDING') matchesTab = u.status === 'PENDENTE_AVALIACAO';
    if (activeTab === 'AVAILABLE') matchesTab = u.status === 'DISPONIVEL';
    if (activeTab === 'PAUSED') matchesTab = u.status === 'PAUSADO';
    if (activeTab === 'RENTED') matchesTab = u.status === 'LOCADO';

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesTab && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Prédios & Unidades</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Gestão de edifícios, salas, apartamentos e controle de <strong>avaliações gratuitas enviadas pelos proprietários</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setIsNewBuildingMode(true);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary text-xs font-black shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-brand-lime" />
            <span>Cadastrar Novo Prédio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsNewBuildingMode(false);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Unidade</span>
          </button>
        </div>
      </div>

      {/* Alerta de Avaliações Pendentes */}
      {pendingEvaluations.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white font-black animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-950">
                {pendingEvaluations.length} {pendingEvaluations.length === 1 ? 'Novo Imóvel Aguardando Avaliação Gratuita!' : 'Novos Imóveis Aguardando Avaliação Gratuita!'}
              </h3>
              <p className="text-xs text-amber-900 mt-0.5">
                Proprietários enviaram imóveis pelo site. Dê o parecer técnico e publique o anúncio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setActiveTab('PENDING'); setStatusFilter('ALL'); }}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-black hover:bg-amber-700 shadow-sm transition-all shrink-0"
          >
            Ver Imóveis Pendentes
          </button>
        </div>
      )}

      {/* Tabs de Filtro Rápido */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'ALL' ? 'bg-brand-lime text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          Todos os Imóveis ({units.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'PENDING' 
              ? 'bg-amber-500 text-white shadow-sm' 
              : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <span>🔔 Avaliações Pendentes</span>
          {pendingEvaluations.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-900 font-black">
              {pendingEvaluations.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AVAILABLE')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'AVAILABLE' ? 'bg-blue-600 text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          Disponíveis / Anunciados ({units.filter(u => u.status === 'DISPONIVEL').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PAUSED')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'PAUSED' ? 'bg-amber-600 text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Pausados ({units.filter(u => u.status === 'PAUSADO').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RENTED')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'RENTED' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          Locados ({units.filter(u => u.status === 'LOCADO').length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por prédio, imóvel, proprietário ou inquilino..."
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
            <option value="PENDENTE_AVALIACAO">Aguardando Avaliação</option>
            <option value="DISPONIVEL">Disponíveis / Vagos</option>
            <option value="PAUSADO">Pausados (Ocultos)</option>
            <option value="LOCADO">Locados</option>
            <option value="REFORMA">Em Reforma</option>
            <option value="REPROVADO">Ajustes Solicitados</option>
          </select>
        </div>
      </div>

      {/* Grid of Units */}
      {filteredUnits.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-border space-y-3">
          <Building2 className="w-12 h-12 text-text-secondary mx-auto opacity-40" />
          <h3 className="text-base font-bold text-text-primary">Nenhum imóvel encontrado</h3>
          <p className="text-xs text-text-secondary">Tente mudar o filtro ou a busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => {
            const isPending = unit.status === 'PENDENTE_AVALIACAO';

            return (
              <div 
                key={unit.id} 
                className={`p-6 rounded-2xl bg-white border shadow-sm space-y-4 transition-all ${
                  isPending ? 'border-2 border-amber-400 bg-amber-50/20 shadow-md' : 'border-border hover:border-brand-lime/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-lime">
                      {unit.type} • {unit.floor}
                    </span>
                    <h3 className="font-extrabold text-base text-text-primary mt-0.5">{unit.unitNumber}</h3>
                    <p className="text-xs text-text-secondary">{unit.buildingName}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    unit.status === 'LOCADO' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : unit.status === 'DISPONIVEL'
                      ? 'bg-blue-100 text-blue-700'
                      : unit.status === 'PAUSADO'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : unit.status === 'PENDENTE_AVALIACAO'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : unit.status === 'REPROVADO'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {unit.status === 'PENDENTE_AVALIACAO' 
                      ? 'AVALIAÇÃO PENDENTE' 
                      : unit.status === 'PAUSADO' 
                      ? 'ANÚNCIO PAUSADO' 
                      : unit.status === 'DISPONIVEL'
                      ? 'DISPONÍVEL NO SITE'
                      : unit.status}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Área Útil:</span>
                    <span className="font-bold text-text-primary">{unit.areaSqm} m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">{isPending ? 'Valor Pretendido:' : 'Aluguel Base:'}</span>
                    <span className="font-bold text-text-primary">R$ {unit.rentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Condomínio + IPTU:</span>
                    <span className="font-bold text-text-primary">R$ {(unit.condoValue + unit.iptuValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between font-black">
                    <span className="text-text-primary">Pacote Total Estimado:</span>
                    <span className="text-brand-lime">
                      R$ {(unit.rentValue + unit.condoValue + unit.iptuValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Dados do Proprietário */}
                <div className="text-xs space-y-1.5 pt-1 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Proprietário:</span>
                    <span className="font-bold text-text-primary">{unit.ownerName}</span>
                  </div>
                  {unit.ownerPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Contato:</span>
                      <span className="font-medium text-text-primary">{unit.ownerPhone}</span>
                    </div>
                  )}
                  {unit.tenantName && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Inquilino:</span>
                      <span className="font-bold text-text-primary">{unit.tenantName}</span>
                    </div>
                  )}
                  {unit.adminFeedback && (
                    <div className="p-2.5 rounded-xl bg-surface border border-border text-[11px] text-text-secondary mt-2">
                      <strong className="text-text-primary block mb-0.5">Parecer da Avaliação:</strong>
                      {unit.adminFeedback}
                    </div>
                  )}
                </div>

                {/* BOTÕES DE AÇÃO: PAUSAR, REATIVAR E EXCLUIR O ANÚNCIO */}
                <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
                  {isPending ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEvaluation(unit)}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Avaliar Imóvel & Emitir Parecer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(unit)}
                        className="w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Solicitação de Anúncio</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {unit.status === 'DISPONIVEL' && (
                        <Link
                          href="/imoveis"
                          className="flex-1 py-2 px-2.5 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                          title="Ver anúncio público no site"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-lime" />
                          <span>Ver no Site</span>
                        </Link>
                      )}

                      {/* Botão de Pausar / Reativar */}
                      {(unit.status === 'DISPONIVEL' || unit.status === 'PAUSADO') && (
                        <button
                          type="button"
                          onClick={() => handleTogglePause(unit)}
                          className={`flex-1 py-2 px-2.5 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            unit.status === 'PAUSADO'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                          }`}
                          title={unit.status === 'PAUSADO' ? 'Reativar e exibir anúncio no site' : 'Pausar e ocultar anúncio do site'}
                        >
                          {unit.status === 'PAUSADO' ? (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Reativar</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pausar</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Botão de Excluir Anúncio */}
                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(unit)}
                        className="py-2 px-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0"
                        title="Excluir permanentemente este imóvel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Técnico de Avaliação do Administrador */}
      {evaluatingUnit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-border max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
            
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Avaliação Técnica Gratuita
                </span>
                <h3 className="text-xl font-black text-text-primary mt-1">
                  {evaluatingUnit.unitNumber}
                </h3>
                <p className="text-xs text-text-secondary">{evaluatingUnit.buildingName}</p>
              </div>
              <button 
                onClick={() => setEvaluatingUnit(null)} 
                className="p-1 rounded-xl text-text-secondary hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha Resumida do Imóvel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface border border-border">
                <span className="text-[10px] text-text-secondary uppercase block font-bold">Tipo</span>
                <strong className="text-xs text-text-primary">{evaluatingUnit.type}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-border">
                <span className="text-[10px] text-text-secondary uppercase block font-bold">Área</span>
                <strong className="text-xs text-text-primary">{evaluatingUnit.areaSqm} m²</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-border">
                <span className="text-[10px] text-text-secondary uppercase block font-bold">Quartos</span>
                <strong className="text-xs text-text-primary">{evaluatingUnit.bedrooms || 1}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-border">
                <span className="text-[10px] text-text-secondary uppercase block font-bold">Proprietário</span>
                <strong className="text-xs text-text-primary truncate block">{evaluatingUnit.ownerName.split(' ')[0]}</strong>
              </div>
            </div>

            {/* Galeria de Fotos Anexadas pelo Proprietário */}
            {evaluatingUnit.photos && evaluatingUnit.photos.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase flex items-center justify-between">
                  <span>Fotos Anexadas pelo Proprietário ({evaluatingUnit.photos.length})</span>
                  <span className="text-[10px] text-brand-lime font-bold">Clique para Ampliar</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-2 bg-surface rounded-2xl border border-border">
                  {evaluatingUnit.photos.map((photoUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewPhotoUrl(photoUrl)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-border shadow-sm block bg-surface-hover cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-brand-lime"
                    >
                      <img 
                        src={photoUrl} 
                        alt={`Foto ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-black">
                        🔍 Ampliar
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ajuste de Valores Recomendados pela Imobiliária - Alinhamento Perfeito */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase block h-4 leading-4 truncate">
                  Aluguel (R$)
                </label>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 focus-within:border-brand-lime h-11">
                  <DollarSign className="w-4 h-4 text-brand-lime shrink-0" />
                  <input 
                    type="number"
                    value={adjustedRent}
                    onChange={(e) => setAdjustedRent(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase block h-4 leading-4 truncate">
                  Condomínio (R$)
                </label>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 focus-within:border-brand-lime h-11">
                  <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
                  <input 
                    type="number"
                    value={adjustedCondo}
                    onChange={(e) => setAdjustedCondo(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase block h-4 leading-4 truncate">
                  IPTU (R$)
                </label>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 focus-within:border-brand-lime h-11">
                  <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
                  <input 
                    type="number"
                    value={adjustedIptu}
                    onChange={(e) => setAdjustedIptu(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Parecer Técnico e Feedback ao Proprietário */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-brand-lime" />
                <span>Parecer Técnico / Feedback ao Proprietário *</span>
              </label>
              <textarea
                rows={4}
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Escreva a análise de mercado e orientações para o proprietário..."
                className="w-full p-3 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime resize-none font-medium leading-relaxed"
                required
              />
              <p className="text-[10px] text-text-secondary">
                Este parecer será exibido no Portal do Proprietário dele e enviado como retorno da avaliação.
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border">
              <button
                type="button"
                onClick={() => handleRejectOrRequestChanges(evaluatingUnit)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 transition-all"
              >
                Solicitar Ajustes
              </button>

              <button
                type="button"
                onClick={() => handleApproveAndPublish(evaluatingUnit)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Aprovar & Publicar Anúncio no Site</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Nova Unidade Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Cadastrar Nova Unidade / Sala</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternador: Novo Prédio vs Prédio Existente */}
            <div className="flex bg-surface p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setIsNewBuildingMode(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isNewBuildingMode 
                    ? 'bg-brand-lime text-white shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ Cadastrar Novo Prédio</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewBuildingMode(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isNewBuildingMode 
                    ? 'bg-brand-lime text-white shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>Prédio Existente</span>
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-4">
              {isNewBuildingMode ? (
                <div className="p-3.5 rounded-2xl bg-surface/60 border border-brand-lime/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-black text-brand-lime uppercase">
                    <Building2 className="w-4 h-4" />
                    <span>Dados do Novo Prédio / Empreendimento</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Nome do Novo Prédio / Condomínio *</label>
                    <input
                      type="text"
                      required={isNewBuildingMode}
                      placeholder="Ex: Residencial Vista Campolim ou Edifício Sorocaba Prime"
                      value={customBuildingName}
                      onChange={(e) => setCustomBuildingName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Rua / Logradouro</label>
                      <input
                        type="text"
                        placeholder="Ex: Av. Antônio Carlos Comitre, 800"
                        value={buildingAddress}
                        onChange={(e) => setBuildingAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Bairro</label>
                      <input
                        type="text"
                        placeholder="Ex: Parque Campolim ou Vila Hortência"
                        value={buildingNeighborhood}
                        onChange={(e) => setBuildingNeighborhood(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Cidade / Estado</label>
                    <input
                      type="text"
                      value={buildingCity}
                      onChange={(e) => setBuildingCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-secondary">Prédio / Condomínio Existente</label>
                    <button
                      type="button"
                      onClick={() => setIsNewBuildingMode(true)}
                      className="text-[11px] text-brand-lime font-black hover:underline"
                    >
                      + Digitar Novo Prédio
                    </button>
                  </div>
                  <select
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    {existingBuildings.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Identificação / Sala / Apto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sala 304, Apto 51"
                    value={newUnitNumber}
                    onChange={(e) => setNewUnitNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Tipo de Unidade</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="CASA">Casa Residencial</option>
                    <option value="SALA">Sala Comercial</option>
                    <option value="STUDIO">Studio / Kitnet</option>
                    <option value="LOJA">Loja Comercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Andar</label>
                  <input
                    type="text"
                    placeholder="Ex: 3º Andar"
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Área Útil (m²)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Aluguel (R$)</label>
                  <input
                    type="number"
                    value={newRent}
                    onChange={(e) => setNewRent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Condomínio (R$)</label>
                  <input
                    type="number"
                    value={newCondo}
                    onChange={(e) => setNewCondo(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">IPTU (R$)</label>
                  <input
                    type="number"
                    value={newIptu}
                    onChange={(e) => setNewIptu(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Proprietário Responsável</label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md"
                >
                  Salvar Unidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Seguro para Visualização / Ampliação de Fotos */}
      {previewPhotoUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute -top-12 right-0 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all cursor-pointer"
              title="Fechar Visualização"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPhotoUrl}
              alt="Foto Ampliada do Imóvel"
              className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/20"
            />
            <div className="mt-3 text-center text-white/90 text-xs font-bold">
              Foto anexada pelo proprietário na avaliação gratuita
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
