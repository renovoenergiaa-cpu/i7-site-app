'use client';

import React, { useState } from 'react';
import { Home, User, CheckCircle2, DollarSign, ShieldCheck } from 'lucide-react';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { BuildingUnit, INITIAL_UNITS, getStoredData, saveStoredData, logAuditEvent } from '@/lib/gestaoData';
import Link from 'next/link';

export default function SellPropertyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [address, setAddress] = useState('');
  
  // Property details
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [bedrooms, setBedrooms] = useState('2');
  const [area, setArea] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [condoValue, setCondoValue] = useState('500');
  const [iptuValue, setIptuValue] = useState('160');

  // Owner details
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Salva na base de gestão com status PENDENTE_AVALIACAO
    const existingUnits = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    const newUnit: BuildingUnit = {
      id: `u-${Date.now()}`,
      buildingName: address || 'Sorocaba - SP',
      unitNumber: `Venda: ${propertyType === 'APARTMENT' ? 'Apartamento' : propertyType === 'HOUSE' ? 'Casa' : 'Imóvel'} em ${address.split(',')[0]}`,
      type: (propertyType === 'APARTMENT' ? 'APARTAMENTO' : propertyType === 'HOUSE' ? 'CASA' : 'COMERCIAL') as any,
      floor: 'Padrão',
      areaSqm: Number(area) || 80,
      rentValue: Number(desiredPrice) ? Math.round(Number(desiredPrice) * 0.005) : 3500, // Estimativa de locação ou venda
      condoValue: Number(condoValue) || 500,
      iptuValue: Number(iptuValue) || 160,
      status: 'PENDENTE_AVALIACAO',
      ownerName: ownerName || 'Proprietário Interessado',
      ownerEmail: 'proprietario@i7.com.br',
      ownerPhone: ownerPhone || '(15) 99999-9999',
      bedrooms: Number(bedrooms) || 2,
      bathrooms: 2,
      parkingSpaces: 1,
      photosCount: 3,
      photos: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
      ],
      address: address || 'Sorocaba - SP',
      neighborhood: address.split(',')[1]?.trim() || 'Sorocaba',
      latitude: -23.515,
      longitude: -47.46,
      evaluationDate: new Date().toLocaleDateString('pt-BR')
    };

    saveStoredData('units', [newUnit, ...existingUnits]);

    // Alerta de e-mail ao Administrador
    fetch('/api/evaluations/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyTitle: newUnit.unitNumber,
        neighborhood: address,
        ownerName,
        ownerEmail: 'proprietario@i7.com.br',
        ownerPhone,
        rentPrice: desiredPrice,
        condoValue,
        iptuValue,
        propertyType
      })
    }).catch(() => {});

    logAuditEvent(
      'NOVA_AVALIACAO_IMOVEL',
      'Avaliações Pendentes',
      `Solicitação de avaliação de venda em ${address} por ${ownerName} (${ownerPhone}) com Condomínio: R$ ${condoValue} e IPTU: R$ ${iptuValue}`,
      'proprietario@i7.com.br'
    );

    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-text-primary">Venda com a i7 Proptech</h1>
        <p className="text-lg text-text-secondary max-w-xl mx-auto">
          Preencha os dados abaixo. Nossa equipe fará uma avaliação gratuita do seu imóvel e o conectará com milhares de compradores interessados.
        </p>
      </div>

      {submitted ? (
        <div className="p-10 rounded-3xl bg-white border border-border shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            Aguardando Avaliação Técnica
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary">Imóvel Recebido para Avaliação!</h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Obrigado, <strong className="text-text-primary">{ownerName}</strong>! Recebemos os dados do imóvel em <strong className="text-text-primary">{address}</strong>. O Administrador foi notificado no painel para realizar o estudo de mercado e liberar o anúncio.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/portal?view=owner"
              className="px-6 py-3 rounded-xl font-black bg-brand-lime text-white shadow-md text-xs hover:bg-brand-lime-hover transition-all"
            >
              Acompanhar no Portal
            </Link>
            <button 
              onClick={() => { setSubmitted(false); setAddress(''); setArea(''); setDesiredPrice(''); }}
              className="px-6 py-3 rounded-xl font-bold bg-surface border border-border text-text-primary text-xs hover:border-brand-lime transition-all"
            >
              Cadastrar Outro Imóvel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-2xl bg-white border border-border shadow-xl space-y-8">
          
          {/* Section: Owner */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3">
              <User className="w-5 h-5 text-brand-lime" /> Seus Dados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Nome Completo</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">WhatsApp</label>
                <input 
                  type="tel" 
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Property */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3">
              <Home className="w-5 h-5 text-brand-lime" /> Sobre o Imóvel
            </h3>
            
            <div className="space-y-1.5 z-50 relative">
              <AddressAutocomplete 
                label="Endereço do Imóvel"
                placeholder="Ex: Avenida Paulista, São Paulo..."
                value={address}
                onChange={setAddress}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Tipo</label>
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                >
                  <option value="APARTMENT">Apartamento</option>
                  <option value="HOUSE">Casa</option>
                  <option value="COMMERCIAL">Comercial</option>
                  <option value="LAND">Terreno</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Quartos</label>
                <select 
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                >
                  <option value="1">1 Quarto</option>
                  <option value="2">2 Quartos</option>
                  <option value="3">3 Quartos</option>
                  <option value="4+">4 ou mais</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Área Útil (m²)</label>
                <input 
                  type="number" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ex: 80"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Valor Pretendido de Venda (R$)
                </label>
                <input 
                  type="number" 
                  value={desiredPrice}
                  onChange={(e) => setDesiredPrice(e.target.value)}
                  placeholder="Ex: 850000"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Condomínio Estimado (R$/mês)</label>
                <input 
                  type="number" 
                  value={condoValue}
                  onChange={(e) => setCondoValue(e.target.value)}
                  placeholder="Ex: 500"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">IPTU Estimado (R$/mês)</label>
                <input 
                  type="number" 
                  value={iptuValue}
                  onChange={(e) => setIptuValue(e.target.value)}
                  placeholder="Ex: 160"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-4 rounded-xl font-bold bg-brand-lime text-white hover:bg-brand-lime-hover shadow-lg shadow-brand-lime/30 text-lg transition-all">
              Enviar para Avaliação Gratuita
            </button>
            <p className="text-xs text-text-muted text-center mt-3">
              Seus dados estão seguros. Ao enviar, você concorda com nossos Termos de Privacidade.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
