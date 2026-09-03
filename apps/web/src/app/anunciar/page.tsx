'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Upload, CheckCircle2, MapPin, X, Navigation } from 'lucide-react';
import { getCurrentSession, UserSession } from '@/lib/auth';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

import { BuildingUnit, INITIAL_UNITS, getStoredData, saveStoredData, logAuditEvent } from '@/lib/gestaoData';
import Link from 'next/link';

export default function AnnouncePropertyPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [condoPrice, setCondoPrice] = useState('450');
  const [iptuPrice, setIptuPrice] = useState('150');
  
  // Localização & Auto-preenchimento
  const [addressSearch, setAddressSearch] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Sorocaba');
  const [state, setState] = useState('SP');
  const [latitude, setLatitude] = useState(-23.515);
  const [longitude, setLongitude] = useState(-47.460);

  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [parkingSpaces, setParkingSpaces] = useState('0');
  const [petFriendly, setPetFriendly] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    setSession(getCurrentSession());
  }, []);

  const handleAddressSelect = (item: any) => {
    if (item.address) {
      if (item.address.road) setStreet(item.address.road);
      if (item.address.suburb) setNeighborhood(item.address.suburb);
      const detectedCity = item.address.city || item.address.town || item.address.municipality;
      if (detectedCity) setCity(detectedCity);
      if (item.address.state) setState(item.address.state);
    }
    if (item.lat && item.lon) {
      setLatitude(parseFloat(item.lat));
      setLongitude(parseFloat(item.lon));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (photoPreviews.length + selectedFiles.length > 10) {
        alert("Máximo de 10 fotos permitido.");
        return;
      }
      setPhotos(prev => [...prev, ...selectedFiles]);

      // Converte arquivos para Base64 DataURL para salvar no imóvel e exibir na avaliação
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotoPreviews(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparando os dados para enviar por email ou API
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', propertyType);
    formData.append('neighborhood', neighborhood);
    formData.append('price', rentPrice);
    formData.append('condo', condoPrice);
    formData.append('iptu', iptuPrice);
    formData.append('bedrooms', bedrooms);
    formData.append('bathrooms', bathrooms);
    formData.append('parkingSpaces', parkingSpaces);
    formData.append('petFriendly', String(petFriendly));
    formData.append('furnished', String(furnished));
    
    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo);
    });

    try {
      await fetch('/api/send-evaluation', {
        method: 'POST',
        body: formData,
      }).catch(() => {});
    } catch (err) {
      console.error(err);
    }

    // Salva o imóvel na base de gestão com status PENDENTE_AVALIACAO e as fotos reais anexadas!
    const existingUnits = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    const ownerName = session?.user?.name || 'Carlos Alberto Silva';
    const ownerEmail = session?.user?.email || 'proprietario@i7.com.br';
    const ownerPhone = session?.user?.phone || '(15) 99123-4567';

    // Imagens padrão de alta resolução para caso o usuário anexe sem arquivos pesados
    const defaultSamplePhotos = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ];

    const finalPhotos = photoPreviews.length > 0 ? photoPreviews : defaultSamplePhotos;

    const fullStreet = street ? `${street}${streetNumber ? ', ' + streetNumber : ''}` : '';
    const fullAddress = fullStreet 
      ? `${fullStreet} - ${neighborhood || 'Centro'}, ${city || 'Sorocaba'} - ${state || 'SP'}`
      : `${title}, ${neighborhood || 'Centro'} - ${city || 'Sorocaba'}, ${state || 'SP'}`;

    const newUnit: BuildingUnit = {
      id: `u-${Date.now()}`,
      buildingName: fullStreet || neighborhood || `${city || 'Sorocaba'} - ${state || 'SP'}`,
      unitNumber: title || 'Imóvel para Avaliação',
      type: (propertyType === 'APARTMENT' ? 'APARTAMENTO' : propertyType === 'STUDIO' ? 'STUDIO' : 'CASA') as any,
      floor: 'Padrão',
      areaSqm: 75,
      rentValue: Number(rentPrice) || 3500,
      condoValue: Number(condoPrice) || 450,
      iptuValue: Number(iptuPrice) || 150,
      status: 'PENDENTE_AVALIACAO', // Fica pendente até o administrador aprovar no painel!
      ownerName,
      ownerEmail,
      ownerPhone,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      parkingSpaces: Number(parkingSpaces) || 0,
      petFriendly,
      furnished,
      photosCount: finalPhotos.length,
      photos: finalPhotos,
      street: street || 'Rua Principal',
      neighborhood: neighborhood || 'Centro',
      city: city || 'Sorocaba',
      state: state || 'SP',
      address: fullAddress,
      latitude: latitude || -23.515,
      longitude: longitude || -47.46,
      evaluationDate: new Date().toLocaleDateString('pt-BR')
    };

    saveStoredData('units', [newUnit, ...existingUnits]);

    // 1. Alerta por E-mail ao Administrador via API
    fetch('/api/evaluations/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyTitle: title,
        neighborhood: `${neighborhood} - ${city}`,
        ownerName,
        ownerEmail,
        ownerPhone,
        rentPrice,
        condoValue: condoPrice,
        iptuValue: iptuPrice,
        propertyType
      })
    }).catch(() => {});

    // 2. Notificação imediata de auditoria no Painel Administrativo
    logAuditEvent(
      'NOVA_AVALIACAO_IMOVEL',
      'Avaliações Pendentes',
      `Novo imóvel enviado para avaliação gratuita: "${title}" em ${city} (${neighborhood}) com Condomínio: R$ ${condoPrice} e IPTU: R$ ${iptuPrice}. Notificação de e-mail enviada para o Administrador.`,
      ownerEmail
    );
    
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
          Avaliação Gratuita & Anúncio
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary">
          Anuncie seu Imóvel na <span className="text-brand-lime">i7 Imobiliária</span>
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto text-sm sm:text-base">
          Preencha as informações abaixo com fotos reais. Nossa equipe técnica avaliará seu imóvel e após a aprovação seu anúncio estará no ar!
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-white border border-border text-center space-y-6 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 bg-brand-lime/10 text-brand-lime rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-primary">Imóvel Enviado para Avaliação!</h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Recebemos todos os dados e as fotos do seu imóvel. A equipe técnica da <strong>i7 Imobiliária</strong> foi notificada e já está preparando o parecer técnico.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border text-xs text-text-secondary max-w-lg mx-auto text-left space-y-1">
            <div className="font-bold text-text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-lime" /> Próximo Passo:
            </div>
            <p>Assim que o Administrador aprovar o imóvel no painel com o feedback técnico, o anúncio será publicado automaticamente no site oficial!</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/portal?view=owner"
              className="px-6 py-3 rounded-xl font-black bg-brand-lime text-white shadow-md text-xs hover:bg-brand-lime-hover transition-all"
            >
              Acompanhar no Portal do Proprietário
            </Link>
            <button 
              onClick={() => { 
                setSubmitted(false); 
                setTitle(''); 
                setRentPrice(''); 
                setAddressSearch('');
                setStreet('');
                setStreetNumber('');
                setNeighborhood(''); 
                setCity('Sorocaba');
                setBedrooms('1');
                setBathrooms('1');
                setParkingSpaces('0');
                setPetFriendly(false);
                setFurnished(false);
                setPhotos([]);
                setPhotoPreviews([]);
              }}
              className="px-6 py-2.5 rounded-xl font-bold bg-surface border border-border hover:border-brand-lime text-sm text-text-primary"
            >
              Cadastrar Outro Imóvel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 rounded-2xl glass-card border border-border space-y-6">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border pb-4">
            <Building2 className="w-5 h-5 text-brand-lime" /> Informações Principais do Imóvel
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Título do Anúncio</label>
              <input 
                type="text" 
                placeholder="Ex: Lindo apartamento reformado em Sorocaba..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Tipo de Imóvel</label>
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none"
              >
                <option value="APARTMENT">Apartamento</option>
                <option value="STUDIO">Studio Tech</option>
                <option value="HOUSE">Casa</option>
                <option value="KITNET">Kitnet</option>
              </select>
            </div>
          </div>

          {/* Localização com Auto-preenchimento por Rua e Cidade */}
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-lime" />
              <h4 className="text-sm font-black text-text-primary">
                Localização do Imóvel (com Auto-preenchimento)
              </h4>
            </div>

            <div className="space-y-1.5">
              <AddressAutocomplete
                label="Digite para Buscar e Auto-preencher Rua, Bairro e Cidade"
                placeholder="Ex: Rua Cel. Nogueira Padilha, Sorocaba ou Parque Campolim..."
                value={addressSearch}
                onChange={setAddressSearch}
                onSelect={handleAddressSelect}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Rua / Logradouro</label>
                <input
                  type="text"
                  placeholder="Ex: Rua Cel. Nogueira Padilha"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Número / Compl.</label>
                <input
                  type="text"
                  placeholder="Ex: 374, Apto 42"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Bairro</label>
                <input
                  type="text"
                  placeholder="Ex: Vila Hortência ou Campolim"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Cidade</label>
                <input
                  type="text"
                  placeholder="Ex: Sorocaba"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Estado</label>
                <input
                  type="text"
                  placeholder="Ex: SP"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>
            </div>
          </div>

          {/* Valores Pretendidos */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h4 className="text-sm font-black text-text-primary">
              Valores Pretendidos & Encargos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Aluguel Pretendido (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 3500"
                  value={rentPrice}
                  onChange={(e) => setRentPrice(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Condomínio Estimado (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 450"
                  value={condoPrice}
                  onChange={(e) => setCondoPrice(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">IPTU Estimado (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 150"
                  value={iptuPrice}
                  onChange={(e) => setIptuPrice(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h4 className="text-sm font-black text-text-primary">
              Características do Imóvel
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Quartos</label>
                <input 
                  type="number" 
                  placeholder="Ex: 2"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Banheiros</label>
                <input 
                  type="number" 
                  placeholder="Ex: 2"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Vagas de Garagem</label>
                <input 
                  type="number" 
                  placeholder="Ex: 1"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-4 bg-surface-card border border-border rounded-xl">
                <input 
                  type="checkbox" 
                  id="petFriendly"
                  checked={petFriendly}
                  onChange={(e) => setPetFriendly(e.target.checked)}
                  className="w-5 h-5 accent-brand-lime rounded focus:ring-brand-lime"
                />
                <label htmlFor="petFriendly" className="text-sm font-bold text-text-primary cursor-pointer">
                  Aceita Pets (Pet Friendly)
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-surface-card border border-border rounded-xl">
                <input 
                  type="checkbox" 
                  id="furnished"
                  checked={furnished}
                  onChange={(e) => setFurnished(e.target.checked)}
                  className="w-5 h-5 accent-brand-lime rounded focus:ring-brand-lime"
                />
                <label htmlFor="furnished" className="text-sm font-bold text-text-primary cursor-pointer">
                  Imóvel Mobiliado
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-text-secondary uppercase">Fotos do Imóvel (Máx 10)</label>
            <div className="p-6 rounded-xl bg-surface border border-dashed border-border text-center space-y-4 relative hover:bg-surface-card transition-colors">
              <input 
                type="file" 
                multiple 
                accept="image/jpeg, image/png, image/webp"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-brand-lime mx-auto" />
              <div>
                <div className="text-sm font-bold text-text-primary">Clique ou arraste as fotos aqui</div>
                <div className="text-[11px] text-text-muted mt-1">Formatos JPG, PNG, WEBP</div>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-surface-card flex items-center justify-center">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`Upload ${index}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-4 rounded-xl font-bold bg-brand-lime text-background hover:bg-brand-lime-hover shadow-glow-lime transition-all">
            Cadastrar Anúncio para Avaliação Gratuita
          </button>
        </form>
      )}

    </div>
  );
}
