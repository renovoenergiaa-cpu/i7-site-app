'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Home, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Upload, 
  Globe, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  DollarSign, 
  MapPin, 
  Sparkles, 
  Bed, 
  Bath, 
  Car, 
  Maximize2, 
  Check, 
  ArrowUpRight, 
  FileText, 
  Image as ImageIcon,
  Flame,
  Layers,
  Info
} from 'lucide-react';
import { BuildingUnit, INITIAL_UNITS, getStoredData, saveStoredData, logAuditEvent } from '@/lib/gestaoData';
import { unitToPropertyDTO } from '@/lib/api';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

export default function PainelImoveisPage() {
  const [units, setUnits] = useState<BuildingUnit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ONLINE' | 'DRAFT' | 'RENTED'>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal de Cadastro / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'APARTAMENTO' | 'STUDIO' | 'CASA' | 'COMERCIAL' | 'SALA' | 'LOJA'>('APARTAMENTO');
  const [formBuilding, setFormBuilding] = useState('');
  const [formUnitNumber, setFormUnitNumber] = useState('');
  const [formFloor, setFormFloor] = useState('');
  
  // Localização
  const [formAddressSearch, setFormAddressSearch] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('Parque Campolim');
  const [formCity, setFormCity] = useState('Sorocaba');
  const [formState, setFormState] = useState('SP');
  const [formZipCode, setFormZipCode] = useState('18047-620');
  const [formLatitude, setFormLatitude] = useState(-23.5285);
  const [formLongitude, setFormLongitude] = useState(-47.4645);

  // Valores (como string para evitar '0' travado ao digitar/apagar)
  const [formRent, setFormRent] = useState<string>('');
  const [formCondo, setFormCondo] = useState<string>('');
  const [formAdminFee, setFormAdminFee] = useState<string>('');

  // Características
  const [formArea, setFormArea] = useState<string>('');
  const [formBedrooms, setFormBedrooms] = useState<string>('1');
  const [formBathrooms, setFormBathrooms] = useState<string>('1');
  const [formParking, setFormParking] = useState<string>('0');
  const [formFurnished, setFormFurnished] = useState(false);
  const [formPetFriendly, setFormPetFriendly] = useState(true);

  // Descrição
  const [formDescription, setFormDescription] = useState('');

  // Fotos
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Status de publicação
  const [publishImmediately, setPublishImmediately] = useState(true);

  // Proprietário
  const [formOwnerName, setFormOwnerName] = useState('i7 Inteligência Imobiliária');
  const [formOwnerEmail, setFormOwnerEmail] = useState('admin@i7.com.br');
  const [formOwnerPhone, setFormOwnerPhone] = useState('(15) 3090-4000');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setUnits(getStoredData('units', INITIAL_UNITS));
  }, []);

  // Estatísticas Rápidas
  const totalUnits = units.length;
  const onlineUnits = units.filter(u => u.status === 'DISPONIVEL').length;
  const draftUnits = units.filter(u => u.status === 'PAUSADO' || u.status === 'PENDENTE_AVALIACAO').length;
  const rentedUnits = units.filter(u => u.status === 'LOCADO').length;
  const totalVgv = units.reduce((acc, u) => acc + (u.rentValue || 0), 0);

  // Filtro
  const filteredUnits = units.filter(u => {
    // Filtro por Tab
    if (filterTab === 'ONLINE' && u.status !== 'DISPONIVEL') return false;
    if (filterTab === 'DRAFT' && u.status !== 'PAUSADO' && u.status !== 'PENDENTE_AVALIACAO') return false;
    if (filterTab === 'RENTED' && u.status !== 'LOCADO') return false;

    // Filtro por Tipo
    if (filterType !== 'ALL' && u.type !== filterType) return false;

    // Busca textual
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = (u.title || '').toLowerCase().includes(term);
      const matchBuilding = (u.buildingName || '').toLowerCase().includes(term);
      const matchUnit = (u.unitNumber || '').toLowerCase().includes(term);
      const matchNeighborhood = (u.neighborhood || '').toLowerCase().includes(term);
      const matchStreet = (u.street || '').toLowerCase().includes(term);
      const matchCity = (u.city || '').toLowerCase().includes(term);
      if (!matchTitle && !matchBuilding && !matchUnit && !matchNeighborhood && !matchStreet && !matchCity) {
        return false;
      }
    }

    return true;
  });

  // Abertura de Modal de Criação
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormType('APARTAMENTO');
    setFormBuilding('');
    setFormUnitNumber('');
    setFormFloor('');
    setFormAddressSearch('');
    setFormStreet('');
    setFormNumber('');
    setFormComplement('');
    setFormNeighborhood('Parque Campolim');
    setFormCity('Sorocaba');
    setFormState('SP');
    setFormZipCode('18047-620');
    setFormLatitude(-23.5285);
    setFormLongitude(-47.4645);
    setFormRent('');
    setFormCondo('');
    setFormAdminFee('');
    setFormArea('');
    setFormBedrooms('1');
    setFormBathrooms('1');
    setFormParking('0');
    setFormFurnished(false);
    setFormPetFriendly(true);
    setFormDescription('');
    setFormPhotos([]);
    setPublishImmediately(true);
    setFormOwnerName('i7 Inteligência Imobiliária');
    setFormOwnerEmail('admin@i7.com.br');
    setFormOwnerPhone('(15) 3090-4000');
    setIsModalOpen(true);
  };

  // Abertura de Modal de Edição
  const handleOpenEditModal = (unit: BuildingUnit) => {
    setEditingId(unit.id);
    setFormTitle(unit.title || unit.unitNumber || '');
    setFormType(unit.type || 'APARTAMENTO');
    setFormBuilding(unit.buildingName || '');
    setFormUnitNumber(unit.unitNumber || '');
    setFormFloor(unit.floor || '');
    setFormAddressSearch(unit.address || unit.street || '');
    setFormStreet(unit.street || unit.address || '');
    setFormNumber(unit.number || '100');
    setFormComplement(unit.complement || '');
    setFormNeighborhood(unit.neighborhood || 'Parque Campolim');
    setFormCity(unit.city || 'Sorocaba');
    setFormState(unit.state || 'SP');
    setFormZipCode(unit.zipCode || '18000-000');
    setFormLatitude(unit.latitude || -23.5285);
    setFormLongitude(unit.longitude || -47.4645);
    setFormRent(unit.rentValue ? String(unit.rentValue) : '');
    setFormCondo(unit.condoValue ? String(unit.condoValue) : '');
    setFormAdminFee((unit.adminFeeValue ?? unit.iptuValue) ? String(unit.adminFeeValue ?? unit.iptuValue) : '');
    setFormArea(unit.areaSqm ? String(unit.areaSqm) : '');
    setFormBedrooms(unit.bedrooms ? String(unit.bedrooms) : '1');
    setFormBathrooms(unit.bathrooms ? String(unit.bathrooms) : '1');
    setFormParking(unit.parkingSpaces !== undefined ? String(unit.parkingSpaces) : '0');
    setFormFurnished(!!unit.furnished);
    setFormPetFriendly(unit.petFriendly !== false);
    setFormDescription(unit.description || '');
    setFormPhotos(unit.photos && unit.photos.length > 0 ? unit.photos : [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000'
    ]);
    setPublishImmediately(unit.status === 'DISPONIVEL');
    setFormOwnerName(unit.ownerName || 'i7 Inteligência Imobiliária');
    setFormOwnerEmail(unit.ownerEmail || 'admin@i7.com.br');
    setFormOwnerPhone(unit.ownerPhone || '(15) 3090-4000');
    setIsModalOpen(true);
  };

  // Subir para o site em 1 clique (Toggle On/Off)
  const handleTogglePublish = (unit: BuildingUnit) => {
    const isCurrentlyOnline = unit.status === 'DISPONIVEL';
    const newStatus = isCurrentlyOnline ? 'PAUSADO' : 'DISPONIVEL';

    const updated = units.map(u => {
      if (u.id === unit.id) {
        return {
          ...u,
          status: newStatus as any,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    });

    setUnits(updated);
    saveStoredData('units', updated);

    if (newStatus === 'DISPONIVEL') {
      const pub = updated.find(u => u.id === unit.id);
      if (pub) {
        fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unitToPropertyDTO(pub))
        }).catch(() => {});
      }
    }

    logAuditEvent(
      newStatus === 'DISPONIVEL' ? 'IMOVEL_PUBLICADO_SITE' : 'IMOVEL_PAUSADO_SITE',
      'Gestão de Anúncios',
      `O imóvel "${unit.title || unit.unitNumber}" foi ${newStatus === 'DISPONIVEL' ? 'SUBIDO PARA O SITE (DISPONÍVEL)' : 'PAUSADO DO SITE'} pelo administrador.`,
      unit.ownerEmail || 'admin@i7.com.br'
    );

    showToast(
      newStatus === 'DISPONIVEL' 
        ? '🚀 Imóvel publicado com sucesso! Ele já está visível para clientes no site.'
        : '⏸️ Imóvel pausado. O anúncio não está mais visível na vitrine pública.'
    );
  };

  // Excluir Imóvel
  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o imóvel "${title}"?`)) return;

    const updated = units.filter(u => u.id !== id);
    setUnits(updated);
    saveStoredData('units', updated);

    logAuditEvent(
      'IMOVEL_EXCLUIDO',
      'Gestão de Anúncios',
      `Imóvel "${title}" excluído do sistema.`,
      'admin@i7.com.br'
    );

    showToast('Imóvel excluído com sucesso.');
  };

  // Upload de Fotos pelo navegador
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (formPhotos.length + files.length > 12) {
        alert('Limite máximo de 12 fotos por imóvel.');
        return;
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormPhotos(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    setFormPhotos(prev => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    setFormPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Gerar descrição automática inteligente
  const handleGenerateSmartDescription = () => {
    const tipoFormatado = formType === 'APARTAMENTO' ? 'Apartamento' : formType === 'STUDIO' ? 'Studio contemporâneo' : formType === 'CASA' ? 'Casa residencial' : 'Excelente imóvel comercial';
    const mobiliadoStr = formFurnished ? 'Totalmente mobiliado com armários planejados de alto padrão' : 'Excelente iluminação natural e ambientes amplos e arejados';
    const petStr = formPetFriendly ? 'Condomínio Pet Friendly para o conforto do seu animal de estimação.' : '';
    const vagasStr = Number(formParking) > 0 ? `${formParking} vaga(s) de garagem coberta(s)` : 'Sem vaga privativa';

    const desc = `${tipoFormatado} disponível para locação no bairro ${formNeighborhood}, em ${formCity} - ${formState}. Com ${formArea}m² de área útil, conta com ${formBedrooms} dormitório(s) (sendo suíte), ${formBathrooms} banheiro(s) e ${vagasStr}. ${mobiliadoStr}. Localização privilegiada com fácil acesso a comércios, restaurantes, escolas e vias rápidas da cidade. ${petStr} Gestão com a garantia e agilidade da i7 Inteligência Imobiliária. Agende sua visita presencial ou por vídeo!`;
    
    setFormDescription(desc);
  };

  // Carregar fotos de alta resolução de exemplo
  const handleLoadSamplePhotos = () => {
    setFormPhotos([
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000'
    ]);
  };

  // Submissão do Formulário
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert('Por favor, informe o título do imóvel para o site.');
      return;
    }

    if (!formRent || Number(formRent) <= 0) {
      alert('Por favor, informe um valor de aluguel válido.');
      return;
    }

    const targetStatus = publishImmediately ? 'DISPONIVEL' : 'PAUSADO';

    const finalPhotos = formPhotos.length > 0 ? formPhotos : [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000'
    ];

    const fullStreet = formStreet 
      ? `${formStreet}${formNumber ? ', ' + formNumber : ''}` 
      : `${formNeighborhood}, ${formCity}`;

    const fullAddress = `${fullStreet}${formComplement ? ' (' + formComplement + ')' : ''} - ${formNeighborhood}, ${formCity} - ${formState}`;

    if (editingId) {
      // Edição
      const updated = units.map(u => {
        if (u.id === editingId) {
          return {
            ...u,
            title: formTitle,
            type: formType,
            buildingName: formBuilding || formTitle,
            unitNumber: formUnitNumber || formTitle,
            floor: formFloor || 'Padrão',
            areaSqm: Number(formArea) || 0,
            rentValue: Number(formRent) || 0,
            condoValue: Number(formCondo) || 0,
            iptuValue: Number(formAdminFee) || 0,
            adminFeeValue: Number(formAdminFee) || 0,
            status: targetStatus as any,
            bedrooms: Number(formBedrooms) || 0,
            bathrooms: Number(formBathrooms) || 0,
            parkingSpaces: Number(formParking) || 0,
            furnished: formFurnished,
            petFriendly: formPetFriendly,
            description: formDescription,
            photos: finalPhotos,
            photosCount: finalPhotos.length,
            street: formStreet || fullStreet,
            number: formNumber || '100',
            complement: formComplement,
            neighborhood: formNeighborhood,
            city: formCity,
            state: formState,
            zipCode: formZipCode,
            latitude: formLatitude,
            longitude: formLongitude,
            address: fullAddress,
            ownerName: formOwnerName,
            ownerEmail: formOwnerEmail,
            ownerPhone: formOwnerPhone,
            updatedAt: new Date().toISOString()
          };
        }
        return u;
      });

      setUnits(updated);
      saveStoredData('units', updated);

      if (targetStatus === 'DISPONIVEL') {
        const ed = updated.find(u => u.id === editingId);
        if (ed) {
          fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(unitToPropertyDTO(ed))
          }).catch(() => {});
        }
      }

      logAuditEvent(
        'IMOVEL_EDITADO',
        'Gestão de Anúncios',
        `Imóvel "${formTitle}" atualizado pelo administrador (Status: ${targetStatus}).`,
        formOwnerEmail
      );

      showToast(targetStatus === 'DISPONIVEL' ? 'Imóvel atualizado e publicado no site!' : 'Alterações salvas como rascunho.');
    } else {
      // Novo Cadastro
      const newId = `u-${Date.now()}`;
      const newUnit: BuildingUnit = {
        id: newId,
        title: formTitle,
        type: formType,
        buildingName: formBuilding || formTitle,
        unitNumber: formUnitNumber || formTitle,
        floor: formFloor || 'Padrão',
        areaSqm: Number(formArea) || 0,
        rentValue: Number(formRent) || 0,
        condoValue: Number(formCondo) || 0,
        iptuValue: Number(formAdminFee) || 0,
        adminFeeValue: Number(formAdminFee) || 0,
        status: targetStatus as any,
        bedrooms: Number(formBedrooms) || 0,
        bathrooms: Number(formBathrooms) || 0,
        parkingSpaces: Number(formParking) || 0,
        furnished: formFurnished,
        petFriendly: formPetFriendly,
        description: formDescription,
        photos: finalPhotos,
        photosCount: finalPhotos.length,
        street: formStreet || fullStreet,
        number: formNumber || '100',
        complement: formComplement,
        neighborhood: formNeighborhood,
        city: formCity,
        state: formState,
        zipCode: formZipCode,
        latitude: formLatitude,
        longitude: formLongitude,
        address: fullAddress,
        ownerName: formOwnerName,
        ownerEmail: formOwnerEmail,
        ownerPhone: formOwnerPhone,
        createdAt: new Date().toISOString()
      };

      const updated = [newUnit, ...units];
      setUnits(updated);
      saveStoredData('units', updated);

      if (targetStatus === 'DISPONIVEL') {
        fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unitToPropertyDTO(newUnit))
        }).catch(() => {});
      }

      logAuditEvent(
        'NOVO_IMOVEL_CADASTRADO',
        'Gestão de Anúncios',
        `Novo imóvel para locação "${formTitle}" cadastrado pelo administrador (Status: ${targetStatus}).`,
        formOwnerEmail
      );

      showToast(
        targetStatus === 'DISPONIVEL' 
          ? '🚀 Imóvel incluído e subido para o site com sucesso!' 
          : '📝 Imóvel salvo como rascunho com sucesso.'
      );
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-brand-lime text-surface-dark px-5 py-3 rounded-2xl shadow-glow-lime flex items-center gap-3 font-bold text-sm animate-bounce">
          <Sparkles className="w-5 h-5 text-surface-dark" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header com Ações Primárias */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-lime/10 flex items-center justify-center text-brand-lime">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-text-primary tracking-tight">
                Imóveis para Aluguel & Vitrine do Site
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Cadastre imóveis para locação, gerencie fotos e publique direto no site da i7 em tempo real.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/imoveis"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover text-sm font-bold transition-all"
          >
            <Globe className="w-4 h-4 text-brand-lime" />
            Ver Vitrine Pública
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-lime text-surface-dark font-black text-sm shadow-glow-lime hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Incluir Imóvel para Aluguel
          </button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">No Ar no Site</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              {onlineUnits}
            </div>
            <span className="text-xs text-text-secondary mt-0.5 block">Disponíveis para locação</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Rascunhos / Pausados</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{draftUnits}</div>
            <span className="text-xs text-text-secondary mt-0.5 block">Prontos para subir</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Imóveis Locados</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{rentedUnits}</div>
            <span className="text-xs text-text-secondary mt-0.5 block">Com contrato ativo</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Portfólio de Locação</span>
            <div className="text-2xl font-black text-text-primary mt-1">
              R$ {totalVgv.toLocaleString('pt-BR')}
            </div>
            <span className="text-xs text-text-secondary mt-0.5 block">{totalUnits} imóveis totais</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-brand-lime/10 text-brand-lime flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs de Status */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-hover rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'ALL' 
                ? 'bg-white text-text-primary shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Todos ({totalUnits})
          </button>
          <button
            onClick={() => setFilterTab('ONLINE')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === 'ONLINE' 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            No Ar no Site ({onlineUnits})
          </button>
          <button
            onClick={() => setFilterTab('DRAFT')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === 'DRAFT' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300"></span>
            Rascunhos / Pausados ({draftUnits})
          </button>
          <button
            onClick={() => setFilterTab('RENTED')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === 'RENTED' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-300"></span>
            Locados ({rentedUnits})
          </button>
        </div>

        {/* Input de Busca & Tipo */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="APARTAMENTO">Apartamentos</option>
            <option value="STUDIO">Studios</option>
            <option value="CASA">Casas</option>
            <option value="COMERCIAL">Comerciais</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, bairro ou rua..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-lime"
            />
          </div>
        </div>
      </div>

      {/* Lista de Imóveis (Cards Ricos com Fotos e Ações Imediatas) */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-border shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center text-text-muted mx-auto">
            <Home className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-text-primary">Nenhum imóvel encontrado</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
              {searchTerm 
                ? 'Nenhum resultado para a sua busca. Tente buscar com outros termos.' 
                : 'Você ainda não cadastrou imóveis nesta categoria.'}
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-lime text-surface-dark font-black text-xs shadow-glow-lime hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Imóvel para Aluguel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => {
            const isOnline = unit.status === 'DISPONIVEL';
            const isDraft = unit.status === 'PAUSADO' || unit.status === 'PENDENTE_AVALIACAO';
            const isRented = unit.status === 'LOCADO';

            const coverPhoto = unit.photos && unit.photos.length > 0 
              ? unit.photos[0] 
              : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';

            const totalMonthly = (unit.rentValue || 0) + (unit.condoValue || 0) + (unit.iptuValue || 0);

            return (
              <div 
                key={unit.id}
                className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group"
              >
                {/* Imagem de Capa com Badges */}
                <div className="relative aspect-[16/10] bg-surface overflow-hidden">
                  <img 
                    src={coverPhoto} 
                    alt={unit.title || unit.unitNumber} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradiente superior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Badge de Status no Canto Superior Esquerdo */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isOnline && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-lg backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        No Ar no Site
                      </span>
                    )}
                    {isDraft && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-lg backdrop-blur-sm">
                        <EyeOff className="w-3 h-3" />
                        Rascunho / Pausado
                      </span>
                    )}
                    {isRented && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-lg backdrop-blur-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        Locado
                      </span>
                    )}
                  </div>

                  {/* Badge de Tipo no Canto Superior Direito */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm border border-white/20">
                      {unit.type}
                    </span>
                  </div>

                  {/* Contagem de Fotos e Valor no Canto Inferior */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">Aluguel</span>
                      <span className="text-xl font-black text-white">
                        R$ {unit.rentValue?.toLocaleString('pt-BR')}
                        <span className="text-xs font-normal text-white/80">/mês</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-white/90">
                      <ImageIcon className="w-3 h-3" />
                      {unit.photos?.length || 1} fotos
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Título */}
                    <h3 className="text-base font-black text-text-primary line-clamp-1 group-hover:text-brand-lime transition-colors">
                      {unit.title || unit.unitNumber}
                    </h3>

                    {/* Localização */}
                    <div className="flex items-center gap-1 text-xs text-text-secondary mt-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                      <span>
                        {unit.street ? `${unit.street}${unit.number ? ', ' + unit.number : ''} - ` : ''}
                        {unit.neighborhood || 'Campolim'}, {unit.city || 'Sorocaba'}
                      </span>
                    </div>

                    {/* Tags de Características */}
                    <div className="grid grid-cols-4 gap-2 mt-4 py-3 border-y border-border text-center text-xs">
                      <div>
                        <span className="text-text-muted block text-[10px] font-bold">Área</span>
                        <span className="font-black text-text-primary flex items-center justify-center gap-1 mt-0.5">
                          <Maximize2 className="w-3 h-3 text-text-muted" />
                          {unit.areaSqm}m²
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] font-bold">Quartos</span>
                        <span className="font-black text-text-primary flex items-center justify-center gap-1 mt-0.5">
                          <Bed className="w-3 h-3 text-text-muted" />
                          {unit.bedrooms || 1}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] font-bold">Banh.</span>
                        <span className="font-black text-text-primary flex items-center justify-center gap-1 mt-0.5">
                          <Bath className="w-3 h-3 text-text-muted" />
                          {unit.bathrooms || 1}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] font-bold">Vagas</span>
                        <span className="font-black text-text-primary flex items-center justify-center gap-1 mt-0.5">
                          <Car className="w-3 h-3 text-text-muted" />
                          {unit.parkingSpaces || 0}
                        </span>
                      </div>
                    </div>

                    {/* Encargos & Total */}
                    <div className="mt-3 flex items-center justify-between text-xs text-text-secondary bg-surface-hover p-2.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-text-muted block">Cond. + Taxa Adm.</span>
                        <span className="font-bold text-text-primary">
                          R$ {((unit.condoValue || 0) + (unit.iptuValue || 0)).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-text-muted block">Pacote Total</span>
                        <span className="font-black text-text-primary">
                          R$ {totalMonthly.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação Imediata */}
                  <div className="space-y-2 pt-2">
                    {/* Botão de Subir para o site / Pausar */}
                    {isOnline ? (
                      <button
                        onClick={() => handleTogglePublish(unit)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black transition-all"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Pausar do Site (Tirar do Ar)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTogglePublish(unit)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-lime hover:bg-brand-lime/90 text-surface-dark text-xs font-black shadow-glow-lime hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Subir para o Site 🚀
                      </button>
                    )}

                    {/* Ações secundárias: Ver no site, Editar, Excluir */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/imoveis/${unit.id}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-surface-hover hover:bg-surface text-text-secondary hover:text-text-primary text-xs font-bold transition-all border border-border"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-lime" />
                        Ver no Site
                      </Link>

                      <button
                        onClick={() => handleOpenEditModal(unit)}
                        className="p-2 rounded-xl bg-surface-hover hover:bg-surface text-text-secondary hover:text-text-primary transition-all border border-border"
                        title="Editar imóvel"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(unit.id, unit.title || unit.unitNumber)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all border border-rose-100"
                        title="Excluir imóvel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CADASTRO E EDIÇÃO COMPLETO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-scale-in">
            {/* Header do Modal */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-text-primary">
                    {editingId ? 'Editar Imóvel para Locação' : 'Incluir Imóvel para Aluguel no Site'}
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Preencha os dados e fotos. Você pode subir direto para o site ou salvar como rascunho.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com Scroll Interno */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Seção 1: Dados Principais */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-lime"></span>
                  1. Informações Principais do Anúncio
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1">
                      Título de Destaque no Site *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Apartamento Conceito com Varanda Gourmet no Campolim"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        Tipo de Imóvel *
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                      >
                        <option value="APARTAMENTO">Apartamento</option>
                        <option value="STUDIO">Studio</option>
                        <option value="CASA">Casa Residencial</option>
                        <option value="COMERCIAL">Imóvel Comercial</option>
                        <option value="SALA">Sala Comercial</option>
                        <option value="LOJA">Loja / Ponto</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        Condomínio / Edifício (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Residencial Campolim Prime"
                        value={formBuilding}
                        onChange={(e) => setFormBuilding(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        Unidade / Andar
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Apto 142 - 14º Andar"
                        value={formUnitNumber}
                        onChange={(e) => setFormUnitNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Localização Completa & Mapa */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-lime"></span>
                  2. Localização & Coordenadas no Mapa
                </h3>

                <div className="space-y-3">
                  <div>
                    <AddressAutocomplete
                      label="Buscar Endereço (Preenchimento Automático)"
                      placeholder="Digite a rua, condomínio ou bairro..."
                      value={formAddressSearch}
                      onChange={setFormAddressSearch}
                      onSelect={(result) => {
                        if (result.address) {
                          if (result.address.road) setFormStreet(result.address.road);
                          if (result.address.suburb) setFormNeighborhood(result.address.suburb);
                          const city = result.address.city || result.address.town;
                          if (city) setFormCity(city);
                          if (result.address.state) setFormState(result.address.state);
                          if (result.address.postcode) setFormZipCode(result.address.postcode);
                        }
                        if (result.lat && result.lon) {
                          setFormLatitude(parseFloat(result.lat));
                          setFormLongitude(parseFloat(result.lon));
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        Rua / Avenida
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Av. Antônio Carlos Comitre"
                        value={formStreet}
                        onChange={(e) => setFormStreet(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 1200"
                        value={formNumber}
                        onChange={(e) => setFormNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Parque Campolim"
                        value={formNeighborhood}
                        onChange={(e) => setFormNeighborhood(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Sorocaba"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        Estado (UF)
                      </label>
                      <input
                        type="text"
                        placeholder="SP"
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-lime uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-primary block mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        placeholder="18047-620"
                        value={formZipCode}
                        onChange={(e) => setFormZipCode(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Valores Financeiros */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-lime"></span>
                  3. Valores de Locação (R$/mês)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1">
                      Aluguel Mensal (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">R$</span>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="0,00"
                        value={formRent}
                        onChange={(e) => setFormRent(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-black text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1">
                      Condomínio Mensal (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">R$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0,00"
                        value={formCondo}
                        onChange={(e) => setFormCondo(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1">
                      Taxa de Administração (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">R$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0,00"
                        value={formAdminFee}
                        onChange={(e) => setFormAdminFee(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                  </div>
                </div>

                {/* Box de Simulação Visual em Tempo Real */}
                <div className="bg-surface-hover p-4 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-xs text-text-secondary block">Total Mensal para o Locatário:</span>
                    <span className="text-xl font-black text-brand-lime">
                      R$ {((Number(formRent) || 0) + (Number(formCondo) || 0) + (Number(formAdminFee) || 0)).toLocaleString('pt-BR')}/mês
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      (Aluguel + Condomínio + Taxa de Administração)
                    </span>
                  </div>

                  <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-xs text-text-secondary block">Repasse Líquido Estimado:</span>
                    <span className="text-base font-black text-emerald-600">
                      R$ {Math.max(0, (Number(formRent) || 0) - (Number(formAdminFee) || 0)).toLocaleString('pt-BR')}/mês
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      (Aluguel deduzida a taxa de administração)
                    </span>
                  </div>
                </div>
              </div>

              {/* Seção 4: Características & Comodidades */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-lime"></span>
                  4. Características & Comodidades
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1">
                      Área Útil (m²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 75"
                      value={formArea}
                      onChange={(e) => setFormArea(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1">
                      Quartos
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formBedrooms}
                      onChange={(e) => setFormBedrooms(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1">
                      Banheiros
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formBathrooms}
                      onChange={(e) => setFormBathrooms(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1">
                      Vagas Garagem
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formParking}
                      onChange={(e) => setFormParking(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-brand-lime"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formFurnished}
                      onChange={(e) => setFormFurnished(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-lime focus:ring-brand-lime border-border"
                    />
                    <span className="text-xs font-bold text-text-primary">Mobiliado</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formPetFriendly}
                      onChange={(e) => setFormPetFriendly(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-lime focus:ring-brand-lime border-border"
                    />
                    <span className="text-xs font-bold text-text-primary">Aceita Animais (Pet Friendly)</span>
                  </label>
                </div>
              </div>

              {/* Seção 5: Descrição Detalhada para o Site */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-lime"></span>
                    5. Descrição do Imóvel para a Vitrine
                  </h3>

                  <button
                    type="button"
                    onClick={handleGenerateSmartDescription}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-lime hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Gerar Descrição Automática
                  </button>
                </div>

                <textarea
                  rows={4}
                  placeholder="Escreva detalhes sobre o imóvel, iluminação, acabamento, vista, diferenciais do condomínio..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-xs text-text-primary focus:outline-none focus:border-brand-lime leading-relaxed"
                />
              </div>

              {/* Seção 6: Fotos & Galeria */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-lime"></span>
                    6. Fotos & Galeria de Mídia ({formPhotos.length})
                  </h3>

                  <button
                    type="button"
                    onClick={handleLoadSamplePhotos}
                    className="text-xs font-bold text-text-secondary hover:text-text-primary underline"
                  >
                    + Carregar fotos de alta resolução
                  </button>
                </div>

                {/* Upload por Arquivo ou URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border hover:border-brand-lime rounded-2xl cursor-pointer bg-surface-hover hover:bg-surface transition-all">
                    <Upload className="w-6 h-6 text-brand-lime mb-1" />
                    <span className="text-xs font-bold text-text-primary">Fazer upload de fotos</span>
                    <span className="text-[10px] text-text-muted mt-0.5">JPG, PNG ou WebP</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex flex-col justify-center space-y-2 p-3 bg-surface rounded-2xl border border-border">
                    <label className="text-xs font-bold text-text-primary">Ou adicione por link/URL:</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://exemplo.com/foto.jpg"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        className="px-3 py-1.5 bg-surface-dark text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Miniaturas de Fotos */}
                {formPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
                    {formPhotos.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-surface">
                        <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-brand-lime text-surface-dark text-[8px] font-black px-1.5 py-0.5 rounded">
                            CAPA
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção 7: Publicação Imediata no Site */}
              <div className="pt-4 border-t border-border">
                <div className="p-4 rounded-2xl border border-brand-lime/30 bg-brand-lime/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-lime/20 flex items-center justify-center text-brand-lime">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-text-primary">Subir para o Site Imediatamente?</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Se ativado, o anúncio fica disponível na hora na vitrine para qualquer visitante alugar.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishImmediately}
                      onChange={(e) => setPublishImmediately(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-lime"></div>
                  </label>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-lime text-surface-dark text-xs font-black shadow-glow-lime hover:scale-105 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {editingId 
                    ? 'Salvar Alterações do Imóvel' 
                    : publishImmediately 
                      ? 'Salvar e Subir para o Site 🚀' 
                      : 'Salvar como Rascunho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
