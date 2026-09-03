'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Eye, 
  X, 
  Camera, 
  Droplet, 
  Zap, 
  Flame, 
  Key, 
  Building2, 
  User, 
  Calendar, 
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  InspectionReport, 
  INITIAL_INSPECTIONS, 
  BuildingUnit, 
  INITIAL_UNITS, 
  getStoredData, 
  saveStoredData, 
  logAuditEvent 
} from '@/lib/gestaoData';

export default function VistoriasPage() {
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [units, setUnits] = useState<BuildingUnit[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AGUARDANDO_ASSINATURAS' | 'HOMOLOGADA' | 'CONTESTADA' | 'RASCUNHO'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ENTRADA' | 'SAIDA' | 'CONSTATACAO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [selectedReport, setSelectedReport] = useState<InspectionReport | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  // Form para nova vistoria
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [newType, setNewType] = useState<'ENTRADA' | 'SAIDA' | 'CONSTATACAO'>('ENTRADA');
  const [newInspectorName, setNewInspectorName] = useState('Marcio Silva (Vistoriador i7)');
  const [newInspectorCreci, setNewInspectorCreci] = useState('CRECI 198244-F');
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newWater, setNewWater] = useState('145,0 m³');
  const [newElectric, setNewElectric] = useState('5.120 kWh');
  const [newGas, setNewGas] = useState('68,0 m³');
  const [newKeys, setNewKeys] = useState(3);
  const [newControls, setNewControls] = useState(2);
  const [newTags, setNewTags] = useState(2);
  const [newNotes, setNewNotes] = useState('Imóvel vistoriado em condições de entrega. Pintura nova e instalações testadas.');

  useEffect(() => {
    const loadedInspections = getStoredData<InspectionReport[]>('inspections', INITIAL_INSPECTIONS);
    const loadedUnits = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    setInspections(loadedInspections);
    setUnits(loadedUnits);
    if (loadedUnits.length > 0) {
      setSelectedUnitId(loadedUnits[0].id);
      setNewOwnerName(loadedUnits[0].ownerName || '');
      setNewOwnerEmail(loadedUnits[0].ownerEmail || '');
      setNewTenantName(loadedUnits[0].tenantName || 'Inquilino a designar');
    }
  }, []);

  // Quando seleciona outra unidade no modal de criação
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setNewOwnerName(unit.ownerName || '');
      setNewOwnerEmail(unit.ownerEmail || '');
      setNewTenantName(unit.tenantName || 'Lucas Mendes');
      setNewTenantEmail('lucas.mendes@gmail.com');
      setNewTenantPhone(unit.ownerPhone || '(15) 99712-3344');
    }
  };

  // Homologar Vistoria
  const handleHomologate = (report: InspectionReport) => {
    const updated = inspections.map(i => {
      if (i.id === report.id) {
        return {
          ...i,
          status: 'HOMOLOGADA' as const,
          signedByInspectorAt: i.signedByInspectorAt || new Date().toLocaleString('pt-BR'),
          signedByTenantAt: new Date().toLocaleString('pt-BR'),
          signedByOwnerAt: new Date().toLocaleString('pt-BR')
        };
      }
      return i;
    });

    setInspections(updated);
    saveStoredData('inspections', updated);
    if (selectedReport && selectedReport.id === report.id) {
      setSelectedReport({
        ...selectedReport,
        status: 'HOMOLOGADA',
        signedByTenantAt: new Date().toLocaleString('pt-BR'),
        signedByOwnerAt: new Date().toLocaleString('pt-BR')
      });
    }

    logAuditEvent(
      'VISTORIA_HOMOLOGADA',
      'Vistorias Digitais',
      `Laudo de vistoria "${report.code}" (${report.unitName}) homologado oficialmente com assinaturas digitais registradas.`,
      report.tenantEmail
    );
  };

  // Criar Nova Vistoria
  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find(u => u.id === selectedUnitId) || units[0];

    const code = `VIS-${new Date().getFullYear()}-${String(inspections.length + 1).padStart(3, '0')}`;
    const newReport: InspectionReport = {
      id: `vis-${Date.now()}`,
      code,
      propertyId: unit?.id || 'prop-default',
      unitName: `${unit?.unitNumber || 'Unidade'} - ${unit?.buildingName || 'Prédio'}`,
      propertyAddress: `${unit?.street || 'Rua Principal'}, ${unit?.neighborhood || 'Parque Campolim'}, Sorocaba - SP`,
      type: newType,
      status: 'AGUARDANDO_ASSINATURAS',
      inspectorName: newInspectorName,
      inspectorCreci: newInspectorCreci,
      tenantName: newTenantName || 'Inquilino Contratante',
      tenantEmail: newTenantEmail || 'inquilino@email.com',
      tenantPhone: newTenantPhone || '(15) 99999-0000',
      ownerName: newOwnerName || unit?.ownerName || 'Proprietário',
      ownerEmail: newOwnerEmail || unit?.ownerEmail || 'proprietario@i7.com.br',
      inspectionDate: new Date().toLocaleString('pt-BR'),
      meters: {
        waterReading: newWater,
        waterMeterNumber: 'HID-' + Math.floor(10000 + Math.random() * 90000),
        electricReading: newElectric,
        electricMeterNumber: 'CPFL-' + Math.floor(100000 + Math.random() * 900000),
        gasReading: newGas,
        keysHandedCount: Number(newKeys),
        remoteControlsCount: Number(newControls),
        accessTagsCount: Number(newTags),
        keysDescription: `${newKeys} chaves originais, ${newControls} controles de portão e ${newTags} tags magnéticas.`
      },
      rooms: [
        {
          id: 'r-new-1',
          name: 'Sala & Living',
          items: [
            {
              id: 'i-new-1',
              name: 'Paredes & Pintura',
              condition: 'NOVO',
              notes: 'Pintura nova sem furos ou manchas.',
              photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']
            },
            {
              id: 'i-new-2',
              name: 'Piso & Rodapé',
              condition: 'BOM',
              notes: 'Piso em perfeito estado de conservação.',
              photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']
            }
          ]
        },
        {
          id: 'r-new-2',
          name: 'Cozinha & Lavanderia',
          items: [
            {
              id: 'i-new-3',
              name: 'Bancada & Torneira',
              condition: 'BOM',
              notes: 'Granito limpo, registro e torneira sem vazamento.',
              photos: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800']
            }
          ]
        },
        {
          id: 'r-new-3',
          name: 'Banheiro',
          items: [
            {
              id: 'i-new-4',
              name: 'Box & Chuveiro',
              condition: 'NOVO',
              notes: 'Chuveiro elétrico funcionando, louças sanitárias higienizadas.',
              photos: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800']
            }
          ]
        }
      ],
      generalNotes: newNotes,
      signedByInspectorAt: new Date().toLocaleString('pt-BR'),
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newReport, ...inspections];
    setInspections(updated);
    saveStoredData('inspections', updated);

    logAuditEvent(
      'NOVA_VISTORIA_DIGITAL',
      'Vistorias Digitais',
      `Laudo de vistoria digital "${code}" criado com sucesso para a unidade "${newReport.unitName}".`,
      newReport.ownerEmail
    );

    setIsNewModalOpen(false);
    setSelectedReport(newReport);
  };

  // Gerar link do WhatsApp para envio do laudo
  const handleOpenWhatsApp = (report: InspectionReport) => {
    const cleanPhone = (report.tenantPhone || '').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá, ${report.tenantName}! Aqui é da i7 Imobiliária.\n\nSeu Laudo Oficial de Vistoria Digital (${report.type === 'ENTRADA' ? 'Check-in de Entrada' : 'Check-out de Saída'}) do imóvel "${report.unitName}" já está pronto com todas as fotos, medidores e checklist técnico.\n\nCódigo do Laudo: ${report.code}\nStatus: ${report.status === 'HOMOLOGADA' ? 'Homologado e Assinado' : 'Aguardando sua conferência em até 5 dias'}\n\nCaso tenha dúvidas ou queira registrar qualquer apontamento, estamos à disposição!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  // Filtros
  const filtered = inspections.filter(i => {
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || i.type === typeFilter;
    const matchesSearch = !searchQuery || 
      i.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const pendingSignaturesCount = inspections.filter(i => i.status === 'AGUARDANDO_ASSINATURAS').length;
  const homologadasCount = inspections.filter(i => i.status === 'HOMOLOGADA').length;
  const entradaCount = inspections.filter(i => i.type === 'ENTRADA').length;
  const saidaCount = inspections.filter(i => i.type === 'SAIDA').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header com Ações */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Vistorias Imobiliárias Digitais</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Inspeções periciais com checklist por cômodos, fotos datadas, leitura de medidores e assinatura digital conforme padrões QuintoAndar/Alude.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Realizar Nova Vistoria Digital</span>
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-text-secondary uppercase">Total de Vistorias</span>
          <div className="text-2xl font-black text-text-primary">{inspections.length}</div>
          <span className="text-[11px] text-text-secondary">Laudos periciais registrados</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-1 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-text-secondary uppercase">Aguardando Assinatura</span>
          <div className="text-2xl font-black text-amber-600 flex items-center gap-2">
            <span>{pendingSignaturesCount}</span>
            {pendingSignaturesCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black animate-pulse">
                Ação pendente
              </span>
            )}
          </div>
          <span className="text-[11px] text-text-secondary">Prazo de 5 dias do inquilino</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-1 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-text-secondary uppercase">Homologadas & Válidas</span>
          <div className="text-2xl font-black text-emerald-600">{homologadasCount}</div>
          <span className="text-[11px] text-text-secondary">Assinadas digitalmente</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-text-secondary uppercase">Entrada vs Saída</span>
          <div className="text-base font-black text-text-primary flex items-center gap-3 pt-1">
            <span className="text-blue-600">📥 {entradaCount} Entrada</span>
            <span className="text-purple-600">📤 {saidaCount} Saída</span>
          </div>
          <span className="text-[11px] text-text-secondary">Check-ins e rescisões</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-black text-text-secondary mr-1">
            <Filter className="w-4 h-4 text-brand-lime" />
            <span>Filtro:</span>
          </div>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-brand-lime text-white shadow-sm'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            Todas ({inspections.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('AGUARDANDO_ASSINATURAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'AGUARDANDO_ASSINATURAS'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>🔔 Aguardando Assinaturas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-800 font-black">
              {pendingSignaturesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('HOMOLOGADA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'HOMOLOGADA'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>✅ Homologadas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-emerald-800 font-black">
              {homologadasCount}
            </span>
          </button>

          {/* Filtro por Tipo */}
          <select
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="ENTRADA">Vistoria de Entrada (Check-in)</option>
            <option value="SAIDA">Vistoria de Saída (Check-out)</option>
            <option value="CONSTATACAO">Constatação Periódica</option>
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por laudo, imóvel, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
          />
        </div>
      </div>

      {/* Lista de Vistorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-border space-y-3">
            <ClipboardCheck className="w-12 h-12 text-text-secondary/40 mx-auto" />
            <p className="text-sm font-bold text-text-secondary">Nenhuma vistoria encontrada para os filtros selecionados.</p>
          </div>
        ) : (
          filtered.map(report => {
            const isEntry = report.type === 'ENTRADA';
            const isHomologated = report.status === 'HOMOLOGADA';
            const totalPhotos = report.rooms.reduce((acc, r) => acc + r.items.reduce((sum, i) => sum + i.photos.length, 0), 0);

            return (
              <div 
                key={report.id}
                className="p-6 rounded-2xl bg-white border border-border hover:border-brand-lime shadow-sm transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isEntry ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {isEntry ? '📥 Vistoria de Entrada (Check-in)' : '📤 Vistoria de Saída (Check-out)'}
                      </span>
                      <span className="font-mono text-xs font-black text-text-primary bg-surface px-2 py-0.5 rounded border border-border">
                        {report.code}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isHomologated 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isHomologated ? 'HOMOLOGADA' : 'AGUARDANDO ASSINATURAS'}
                    </span>
                  </div>

                  {/* Imóvel */}
                  <div>
                    <h3 className="text-base font-black text-text-primary hover:text-brand-lime transition-colors">
                      {report.unitName}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      📍 {report.propertyAddress}
                    </p>
                  </div>

                  {/* Detalhes Técnicos */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface p-3 rounded-xl border border-border">
                    <div>
                      <span className="text-text-secondary block text-[10px] uppercase font-bold">Inquilino:</span>
                      <span className="font-bold text-text-primary truncate block">{report.tenantName}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block text-[10px] uppercase font-bold">Proprietário:</span>
                      <span className="font-bold text-text-primary truncate block">{report.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block text-[10px] uppercase font-bold">Data da Inspeção:</span>
                      <span className="font-medium text-text-primary">{report.inspectionDate}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block text-[10px] uppercase font-bold">Vistoriador Responsável:</span>
                      <span className="font-medium text-text-primary">{report.inspectorName}</span>
                    </div>
                  </div>

                  {/* Resumo de Medidores e Cômodos */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-text-secondary">
                    <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-blue-600" />
                      Água: {report.meters.waterReading || 'N/A'}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                      Luz: {report.meters.electricReading || 'N/A'}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-red-50 text-red-800 font-bold flex items-center gap-1">
                      <Key className="w-3 h-3 text-red-600" />
                      {report.meters.keysHandedCount} Chaves entregues
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-800 font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3 text-purple-600" />
                      {totalPhotos} fotos registradas
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="flex-1 py-2 px-3 rounded-xl bg-surface border border-border hover:border-brand-lime text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand-lime" />
                    <span>Ver Laudo Pericial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReport(report);
                      setIsPrintModalOpen(true);
                    }}
                    className="py-2 px-3 rounded-xl bg-surface border border-border hover:border-text-primary text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Visualizar e Imprimir Laudo Pericial em PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(report)}
                    className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Enviar laudo de vistoria no WhatsApp do inquilino"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {!isHomologated && (
                    <button
                      type="button"
                      onClick={() => handleHomologate(report)}
                      className="py-2 px-3 rounded-xl bg-brand-lime hover:bg-brand-lime-hover text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Homologar vistoria com assinaturas digitais"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Homologar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE VISUALIZAÇÃO DETALHADA DO LAUDO PERICIAL */}
      {selectedReport && !isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-brand-lime bg-lime-50 px-2 py-0.5 rounded border border-lime-200">
                    {selectedReport.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedReport.type === 'ENTRADA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {selectedReport.type === 'ENTRADA' ? 'Vistoria de Entrada' : 'Vistoria de Saída'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-text-primary mt-1">{selectedReport.unitName}</h2>
                <p className="text-xs text-text-secondary">{selectedReport.propertyAddress}</p>
              </div>

              <button 
                type="button" 
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-surface cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Medidores de Consumo & Chaves */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span>Leituras de Medidores & Entrega de Chaves</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
                  <span className="text-blue-800 font-bold block text-[10px]">💧 Água (Hidrômetro):</span>
                  <span className="text-base font-black text-blue-950">{selectedReport.meters.waterReading || 'N/A'}</span>
                  <span className="text-[10px] text-blue-700 block mt-0.5">{selectedReport.meters.waterMeterNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                  <span className="text-amber-800 font-bold block text-[10px]">⚡ Energia (CPFL):</span>
                  <span className="text-base font-black text-amber-950">{selectedReport.meters.electricReading || 'N/A'}</span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">{selectedReport.meters.electricMeterNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 text-xs">
                  <span className="text-red-800 font-bold block text-[10px]">🔥 Gás Encanado:</span>
                  <span className="text-base font-black text-red-950">{selectedReport.meters.gasReading || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs">
                  <span className="text-purple-800 font-bold block text-[10px]">🔑 Chaves & Tags:</span>
                  <span className="text-base font-black text-purple-950">
                    {selectedReport.meters.keysHandedCount} Chaves
                  </span>
                  <span className="text-[10px] text-purple-700 block mt-0.5">{selectedReport.meters.accessTagsCount} tags magnéticas</span>
                </div>
              </div>
              {selectedReport.meters.keysDescription && (
                <p className="text-xs text-text-secondary bg-surface p-2.5 rounded-xl border border-border">
                  <strong>Detalhamento das chaves:</strong> {selectedReport.meters.keysDescription}
                </p>
              )}
            </div>

            {/* Ambientes & Checklist com Evidências Fotográficas */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-lime" />
                <span>Checklist Pericial por Cômodo</span>
              </h3>

              {selectedReport.rooms.map((room, rIdx) => (
                <div key={room.id || rIdx} className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                  <h4 className="text-sm font-black text-text-primary flex items-center justify-between">
                    <span>{room.name}</span>
                    <span className="text-[11px] font-medium text-text-secondary">{room.items.length} itens inspecionados</span>
                  </h4>

                  <div className="space-y-3">
                    {room.items.map((item, iIdx) => (
                      <div key={item.id || iIdx} className="p-3 rounded-xl bg-white border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-text-primary">{item.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            item.condition === 'NOVO' ? 'bg-emerald-100 text-emerald-700' :
                            item.condition === 'BOM' ? 'bg-blue-100 text-blue-700' :
                            item.condition === 'REGULAR' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            Estado: {item.condition}
                          </span>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed">{item.notes}</p>

                        {/* Fotos do Item */}
                        {item.photos && item.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.photos.map((photo, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setEnlargedPhoto(photo)}
                                className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group cursor-pointer"
                              >
                                <img src={photo} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Termo e Assinaturas Digitais */}
            <div className="p-4 rounded-2xl bg-lime-50/50 border border-lime-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-lime-950 uppercase">
                <ShieldCheck className="w-4 h-4 text-lime-600" />
                <span>Assinaturas Digitais & Homologação Pericial</span>
              </div>
              <p className="text-xs text-lime-900 leading-relaxed">
                As partes declaram ciência das condições do imóvel descritas neste laudo digital com fé pública e validade jurídica.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-lime-200/60">
                <div>
                  <span className="text-lime-800 font-bold block">Vistoriador Responsável:</span>
                  <span className="font-medium text-lime-950">{selectedReport.inspectorName}</span>
                  <span className="text-[10px] text-lime-700 block">Assinado em {selectedReport.signedByInspectorAt || 'Pendente'}</span>
                </div>
                <div>
                  <span className="text-lime-800 font-bold block">Inquilino (Locatário):</span>
                  <span className="font-medium text-lime-950">{selectedReport.tenantName}</span>
                  <span className="text-[10px] text-lime-700 block">Assinado em {selectedReport.signedByTenantAt || 'Aguardando validação'}</span>
                </div>
                <div>
                  <span className="text-lime-800 font-bold block">Proprietário (Locador):</span>
                  <span className="font-medium text-lime-950">{selectedReport.ownerName}</span>
                  <span className="text-[10px] text-lime-700 block">Assinado em {selectedReport.signedByOwnerAt || 'Homologado'}</span>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => handleOpenWhatsApp(selectedReport)}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Notificação no WhatsApp</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-surface border border-border hover:border-text-primary text-text-primary text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Laudo Completo</span>
                </button>

                {selectedReport.status !== 'HOMOLOGADA' && (
                  <button
                    type="button"
                    onClick={() => handleHomologate(selectedReport)}
                    className="py-2.5 px-5 rounded-xl bg-brand-lime hover:bg-brand-lime-hover text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Homologar Vistoria</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO / LAUDO PERICIAL OFICIAL EM PDF */}
      {selectedReport && isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl space-y-6 my-8 max-h-[95vh] overflow-y-auto print:m-0 print:p-0 print:shadow-none">
            
            {/* Barra de Ação de Impressão (oculta na impressão nativa) */}
            <div className="flex items-center justify-between pb-4 border-b border-border print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-lime" />
                <span className="text-sm font-black text-text-primary">Pré-visualização do Laudo Pericial Oficial i7</span>
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
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-xl text-text-secondary hover:bg-surface cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CONTEÚDO PERICIAL FORMAL DO LAUDO */}
            <div className="space-y-6 text-gray-900 font-sans">
              
              {/* Cabeçalho Oficial com Logo e Dados da Imobiliária */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-gray-900">
                <div>
                  <div className="text-2xl font-black tracking-tight text-gray-950 flex items-center gap-2">
                    <span>i7 GESTÃO IMOBILIÁRIA</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Sede Corporativa: R. Cel. Nogueira Padilha, 374 - Vila Hortência, Sorocaba - SP | CRECI 39.481-J
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black uppercase text-gray-500">Documento Pericial</div>
                  <div className="text-base font-black font-mono text-gray-900">{selectedReport.code}</div>
                  <div className="text-[10px] text-gray-500">Emissão: {selectedReport.inspectionDate}</div>
                </div>
              </div>

              {/* Título do Laudo */}
              <div className="text-center py-2 bg-gray-100 rounded-lg">
                <h2 className="text-base font-black uppercase tracking-wider text-gray-900">
                  {selectedReport.type === 'ENTRADA' ? 'LAUDO PERICIAL DE VISTORIA DE ENTRADA (CHECK-IN)' : 'LAUDO PERICIAL DE VISTORIA DE SAÍDA (CHECK-OUT)'}
                </h2>
              </div>

              {/* Dados das Partes e do Imóvel */}
              <div className="grid grid-cols-2 gap-4 text-xs border p-4 rounded-lg bg-gray-50/50">
                <div>
                  <strong className="block text-gray-500 uppercase text-[10px]">Imóvel / Unidade:</strong>
                  <span className="font-bold text-sm text-gray-900">{selectedReport.unitName}</span>
                  <p className="text-gray-600 mt-0.5">{selectedReport.propertyAddress}</p>
                </div>
                <div>
                  <strong className="block text-gray-500 uppercase text-[10px]">Vistoriador Perito:</strong>
                  <span className="font-bold text-gray-900">{selectedReport.inspectorName}</span>
                  <span className="block text-gray-600">{selectedReport.inspectorCreci}</span>
                </div>
                <div>
                  <strong className="block text-gray-500 uppercase text-[10px]">Locatário (Inquilino):</strong>
                  <span className="font-bold text-gray-900">{selectedReport.tenantName}</span>
                  <span className="block text-gray-600">{selectedReport.tenantEmail} | {selectedReport.tenantPhone}</span>
                </div>
                <div>
                  <strong className="block text-gray-500 uppercase text-[10px]">Locador (Proprietário):</strong>
                  <span className="font-bold text-gray-900">{selectedReport.ownerName}</span>
                  <span className="block text-gray-600">{selectedReport.ownerEmail}</span>
                </div>
              </div>

              {/* Medidores e Chaves */}
              <div className="border p-4 rounded-lg space-y-2 text-xs">
                <h4 className="font-black uppercase text-gray-700 text-[11px]">1. Medidores de Consumo na Entrega e Chaves</h4>
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-2 bg-gray-100 rounded">
                    <span className="block text-[10px] text-gray-600 font-bold">Água:</span>
                    <span className="font-bold">{selectedReport.meters.waterReading || 'N/A'}</span>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <span className="block text-[10px] text-gray-600 font-bold">Luz (CPFL):</span>
                    <span className="font-bold">{selectedReport.meters.electricReading || 'N/A'}</span>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <span className="block text-[10px] text-gray-600 font-bold">Gás:</span>
                    <span className="font-bold">{selectedReport.meters.gasReading || 'N/A'}</span>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <span className="block text-[10px] text-gray-600 font-bold">Chaves Entregues:</span>
                    <span className="font-bold">{selectedReport.meters.keysHandedCount} chaves / {selectedReport.meters.accessTagsCount} tags</span>
                  </div>
                </div>
              </div>

              {/* Vistoria Detalhada por Cômodos com Fotos */}
              <div className="space-y-4">
                <h4 className="font-black uppercase text-gray-700 text-[11px] border-b pb-1">
                  2. Inspeção Minuciosa dos Cômodos & Benfeitorias
                </h4>

                {selectedReport.rooms.map((room, idx) => (
                  <div key={idx} className="border p-3 rounded-lg space-y-2">
                    <div className="font-bold text-xs bg-gray-100 p-1.5 rounded flex justify-between">
                      <span>{room.name}</span>
                      <span className="text-[10px] text-gray-500">{room.items.length} itens</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {room.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="p-2 bg-gray-50 rounded border border-gray-100">
                          <div className="flex justify-between font-bold">
                            <span>• {item.name}</span>
                            <span className="text-[10px] uppercase font-black">Estado: [{item.condition}]</span>
                          </div>
                          <p className="text-gray-700 mt-1">{item.notes}</p>
                          {item.photos && item.photos.length > 0 && (
                            <div className="flex gap-2 pt-2">
                              {item.photos.map((ph, pIdx) => (
                                <img key={pIdx} src={ph} alt="" className="w-20 h-16 object-cover rounded border" />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Parecer Geral */}
              {selectedReport.generalNotes && (
                <div className="border p-3 rounded-lg text-xs space-y-1">
                  <h4 className="font-black uppercase text-gray-700 text-[11px]">3. Observações Gerais & Prazo de Contestação</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedReport.generalNotes}</p>
                </div>
              )}

              {/* Termo de Encerramento e Assinaturas */}
              <div className="pt-6 border-t-2 border-gray-900 space-y-6">
                <p className="text-[11px] text-gray-600 text-justify leading-relaxed">
                  E por estarem justos e de pleno acordo com as constatações lavradas no presente laudo de vistoria, que passa a integrar o contrato de locação para todos os fins de direito, firmam eletronicamente com carimbo de data e hora.
                </p>

                <div className="grid grid-cols-3 gap-6 text-center text-xs pt-4">
                  <div className="border-t border-gray-400 pt-2">
                    <strong className="block text-gray-900">{selectedReport.inspectorName}</strong>
                    <span className="text-[10px] text-gray-600 block">{selectedReport.inspectorCreci}</span>
                    <span className="text-[9px] text-emerald-700 font-bold block mt-1">Assinatura Digital Válida</span>
                  </div>

                  <div className="border-t border-gray-400 pt-2">
                    <strong className="block text-gray-900">{selectedReport.tenantName}</strong>
                    <span className="text-[10px] text-gray-600 block">Locatário</span>
                    <span className="text-[9px] text-emerald-700 font-bold block mt-1">
                      {selectedReport.signedByTenantAt ? `Assinado em ${selectedReport.signedByTenantAt}` : 'Aceite eletrônico registrado'}
                    </span>
                  </div>

                  <div className="border-t border-gray-400 pt-2">
                    <strong className="block text-gray-900">{selectedReport.ownerName}</strong>
                    <span className="text-[10px] text-gray-600 block">Locador</span>
                    <span className="text-[9px] text-emerald-700 font-bold block mt-1">
                      {selectedReport.signedByOwnerAt ? `Assinado em ${selectedReport.signedByOwnerAt}` : 'Homologado'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL PARA REALIZAR NOVA VISTORIA DIGITAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-brand-lime" />
                <h3 className="text-base font-black text-text-primary">Iniciar Nova Vistoria Digital</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:bg-surface cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-4">
              
              {/* Seleção do Imóvel */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Selecione a Unidade / Imóvel *</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => handleSelectUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber} - {u.buildingName} ({u.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Vistoria */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Tipo de Vistoria</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="ENTRADA">Vistoria de Entrada (Check-in)</option>
                    <option value="SAIDA">Vistoria de Saída (Check-out)</option>
                    <option value="CONSTATACAO">Constatação Periódica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Vistoriador Perito</label>
                  <input
                    type="text"
                    value={newInspectorName}
                    onChange={(e) => setNewInspectorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                    required
                  />
                </div>
              </div>

              {/* Dados das Partes */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-surface rounded-xl border border-border">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Inquilino (Nome)</label>
                  <input
                    type="text"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">WhatsApp Inquilino</label>
                  <input
                    type="text"
                    value={newTenantPhone}
                    onChange={(e) => setNewTenantPhone(e.target.value)}
                    placeholder="(15) 99999-0000"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                    required
                  />
                </div>
              </div>

              {/* Medidores de Consumo */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-text-secondary uppercase">Leituras Iniciais / Medidores</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-text-secondary">Água (m³)</label>
                    <input
                      type="text"
                      value={newWater}
                      onChange={(e) => setNewWater(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-secondary">Energia (kWh)</label>
                    <input
                      type="text"
                      value={newElectric}
                      onChange={(e) => setNewElectric(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-secondary">Gás (m³)</label>
                    <input
                      type="text"
                      value={newGas}
                      onChange={(e) => setNewGas(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Chaves e Controles */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-text-secondary">Qtd. Chaves</label>
                  <input
                    type="number"
                    value={newKeys}
                    onChange={(e) => setNewKeys(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-secondary">Qtd. Controles</label>
                  <input
                    type="number"
                    value={newControls}
                    onChange={(e) => setNewControls(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-secondary">Qtd. Tags Acesso</label>
                  <input
                    type="number"
                    value={newTags}
                    onChange={(e) => setNewTags(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-bold"
                  />
                </div>
              </div>

              {/* Observações Gerais */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Observações do Laudo Técnico</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime resize-none"
                />
              </div>

              {/* Botões do Modal */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs font-bold hover:bg-surface-hover cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Laudo e Abrir Checklist</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL PARA EXPANDIR FOTO DA VISTORIA */}
      {enlargedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh]">
            <img src={enlargedPhoto} alt="Evidência da Vistoria" className="w-full h-auto max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
            <button
              type="button"
              onClick={() => setEnlargedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
