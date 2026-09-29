'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Filter, Grid, Map as MapIcon, Heart, Check, SlidersHorizontal, Sparkles, Building2, ArrowRight, RotateCw, ChevronLeft, ChevronRight, Camera, Maximize2 } from 'lucide-react';
import { fetchProperties } from '@/lib/api';
import { PropertyDTO } from '@i7/types';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { PropertyMap } from '@/components/PropertyMap';
import { ImageSliderModal } from '@/components/ImageSliderModal';

function SearchPropertiesContent() {
  const searchParams = useSearchParams();
  const initMode = searchParams.get('mode') || 'rent';
  const initNeighborhood = searchParams.get('neighborhood') || '';
  const initType = searchParams.get('type') || '';

  const initView = searchParams.get('view') === 'map' ? 'map' : 'grid';

  const [properties, setProperties] = useState<PropertyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>(initView);
  
  // Slider Lightbox State
  const [sliderProperty, setSliderProperty] = useState<PropertyDTO | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  
  // Filter States
  const [searchNeighborhood, setSearchNeighborhood] = useState(initNeighborhood);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(initNeighborhood); // Usado para o mapa
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [selectedType, setSelectedType] = useState(initType);
  const [searchMode, setSearchMode] = useState(initMode); // 'buy' | 'rent'
  const [maxPrice, setMaxPrice] = useState(initMode === 'buy' ? 5000000 : 50000);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [parking, setParking] = useState<number | null>(null);
  const [petFriendly, setPetFriendly] = useState(false);
  const [furnished, setFurnished] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchProperties().then(data => {
      setProperties(data);
      setLoading(false);
    });
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (e) {}
    loadData();
  };

  useEffect(() => {
    // Limpa automaticamente caches antigos do navegador caso o celular guarde versão defasada
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      }).catch(() => {});
    }
    loadData();
  }, []);

  const filteredProperties = properties.filter(p => {
    const priceToCompare = searchMode === 'buy' ? (p.salePrice || p.rentPrice * 180) : (p.totalMonthly || p.rentPrice);
    
    // Check location & keywords (matching street, neighborhood, city, title and description)
    if (searchNeighborhood && searchNeighborhood.trim().length > 0) {
      const clean = (str?: string) => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const rawQuery = clean(searchNeighborhood);
      const searchTerms = rawQuery.split(/[,-]/).map(t => t.trim()).filter(Boolean);

      const propText = `${clean(p.title)} ${clean(p.neighborhood)} ${clean(p.street)} ${clean(p.city)} ${clean(p.description)} ${clean(p.number)}`;

      const matchesLocation = searchTerms.some(term => propText.includes(term)) || propText.includes(rawQuery);
      if (!matchesLocation) return false;
    }

    if (selectedType) {
      const pTypeNorm = (p.type === 'APARTMENT' || (p.type as any) === 'APARTAMENTO') ? 'APARTMENT' : p.type;
      if (pTypeNorm !== selectedType) return false;
    }
    const isSliderAtMax = searchMode === 'buy' ? maxPrice >= 5000000 : maxPrice >= 50000;
    if (!isSliderAtMax && priceToCompare > maxPrice) return false;
    if (bedrooms !== null && bedrooms > 0 && p.bedrooms < bedrooms) return false;
    if (bathrooms !== null && bathrooms > 0 && p.bathrooms < bathrooms) return false;
    
    const propParking = p.parkingSpots ?? 0;
    if (parking !== null && parking > 0 && propParking < parking) return false;
    
    if (petFriendly && !p.petFriendly) return false;
    if (furnished && !p.furnished) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Search Bar & View Mode Controller */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        <div className="flex-1 w-full flex items-center z-50">
          <AddressAutocomplete 
            placeholder="Buscar por bairro, rua ou cidade..."
            value={searchNeighborhood}
            onChange={setSearchNeighborhood}
            label=""
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="text-xs text-text-muted bg-surface-hover px-4 py-2 rounded-xl">
            <span className="text-text-primary font-bold">{filteredProperties.length}</span> imóveis
          </div>

          <button
            onClick={handleManualRefresh}
            title="Atualizar lista e limpar cache"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-border text-text-secondary transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-lime' : ''}`} />
            <span>Atualizar</span>
          </button>

          <div className="flex items-center bg-surface-hover p-1 rounded-xl border border-border">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-brand-lime text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Grid className="w-4 h-4" /> Lista
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-brand-lime text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <MapIcon className="w-4 h-4" /> Mapa
            </button>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6 p-6 rounded-2xl bg-white border border-border shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-lime" /> Filtros
            </h3>
            <button 
              onClick={() => {
                setSearchNeighborhood('');
                setSelectedType('');
                setMaxPrice(searchMode === 'buy' ? 3000000 : 15000);
                setBedrooms(null);
                setBathrooms(null);
                setParking(null);
                setPetFriendly(false);
                setFurnished(false);
              }}
              className="text-xs font-medium text-brand-lime hover:underline"
            >
              Limpar
            </button>
          </div>

          {/* Negócio: Comprar / Alugar */}
          <div className="flex bg-surface-hover p-1 rounded-xl">
             <button 
                onClick={() => { setSearchMode('buy'); setMaxPrice(3000000); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${searchMode === 'buy' ? 'bg-white text-brand-lime shadow-sm' : 'text-text-secondary'}`}
             >
                Comprar
             </button>
             <button 
                onClick={() => { setSearchMode('rent'); setMaxPrice(50000); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${searchMode === 'rent' ? 'bg-white text-brand-lime shadow-sm' : 'text-text-secondary'}`}
             >
                Alugar
             </button>
          </div>

          {/* Tipo de Imóvel */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tipo de imóvel</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
            >
              <option value="">Todos os tipos</option>
              <option value="APARTMENT">Apartamento</option>
              <option value="STUDIO">Studio</option>
              <option value="HOUSE">Casa</option>
              <option value="COMMERCIAL">Comercial</option>
            </select>
          </div>

          {/* Preço Máximo */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-text-secondary uppercase tracking-wider">Valor Máx.</span>
              <span className="text-brand-lime">Até R$ {maxPrice.toLocaleString('pt-BR')}</span>
            </div>
            <input 
              type="range" 
              min={searchMode === 'buy' ? 100000 : 1500} 
              max={searchMode === 'buy' ? 5000000 : 50000} 
              step={searchMode === 'buy' ? 50000 : 500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-lime cursor-pointer"
            />
          </div>

          {/* Quartos */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Quartos mín.</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setBedrooms(bedrooms === num ? null : num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    bedrooms === num ? 'bg-brand-lime text-white border-brand-lime' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>

          {/* Banheiros */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Banheiros mín.</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={`bath-${num}`}
                  onClick={() => setBathrooms(bathrooms === num ? null : num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    bathrooms === num ? 'bg-brand-lime text-white border-brand-lime' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>

          {/* Vagas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Vagas mín.</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={`park-${num}`}
                  onClick={() => setParking(parking === num ? null : num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    parking === num ? 'bg-brand-lime text-white border-brand-lime' : 'bg-surface-hover border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={petFriendly}
                onChange={(e) => setPetFriendly(e.target.checked)}
                className="w-5 h-5 accent-brand-lime rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-text-secondary hover:text-text-primary">Aceita Pets 🐾</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={furnished}
                onChange={(e) => setFurnished(e.target.checked)}
                className="w-5 h-5 accent-brand-lime rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-text-secondary hover:text-text-primary">Mobiliado 🛋️</span>
            </label>
          </div>

          <button 
            onClick={() => {
              setAppliedSearchQuery(searchNeighborhood);
              setSearchTrigger(prev => prev + 1);
            }}
            className="w-full py-3.5 mt-6 rounded-xl font-bold bg-brand-lime text-white shadow-lg shadow-brand-lime/30 hover:bg-brand-lime-hover transition-colors flex justify-center items-center gap-2"
          >
            <Search className="w-5 h-5" /> Buscar e Mapear
          </button>

        </div>

        {/* Results View Grid / Map */}
        <div className="lg:col-span-3">
          
          {loading ? (
             <div className="flex justify-center items-center h-64">Carregando imóveis...</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.length === 0 ? (
                <div className="col-span-full py-16 px-4 text-center rounded-2xl bg-white border border-border shadow-sm space-y-4">
                  <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mx-auto">
                    <Building2 className="w-7 h-7 text-brand-lime" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-text-primary">
                      {properties.length === 0 ? 'Nenhum imóvel disponível no momento' : 'Nenhum imóvel encontrado para os filtros aplicados'}
                    </h3>
                    <p className="text-xs text-text-secondary max-w-md mx-auto">
                      {properties.length === 0 
                        ? 'Seja o primeiro a anunciar na i7! Publique seu imóvel e aproveite nossa gestão 100% digital.'
                        : 'Tente ajustar sua busca ou remover alguns filtros para encontrar mais opções.'}
                    </p>
                  </div>
                  {properties.length === 0 ? (
                    <Link
                      href="/anunciar"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-lime text-white font-bold text-xs shadow hover:bg-brand-lime-hover transition-all"
                    >
                      Anuncie seu Imóvel <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setSearchNeighborhood('');
                        setSelectedType('');
                        setBedrooms(null);
                        setBathrooms(null);
                        setParking(null);
                        setPetFriendly(false);
                        setFurnished(false);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-text-primary font-bold text-xs hover:border-brand-lime transition-all"
                    >
                      Limpar todos os filtros
                    </button>
                  )}
                </div>
              ) : (
                filteredProperties.map(prop => (
                  <CatalogPropertyCard
                    key={prop.id}
                    prop={prop}
                    searchMode={searchMode}
                    onOpenSlider={(selectedProp, idx) => {
                      setSliderProperty(selectedProp);
                      setSliderIndex(idx);
                    }}
                  />
                ))
              )}
            </div>
          ) : (
            /* MAP INTERACTIVE VIEW */
            <PropertyMap 
              properties={filteredProperties} 
              searchMode={searchMode as 'buy' | 'rent' | 'sell'} 
              searchQuery={searchNeighborhood || appliedSearchQuery}
              searchTrigger={searchTrigger}
            />
          )}

        </div>

      </div>

      {/* LIGHTBOX SLIDE MODAL */}
      <ImageSliderModal
        isOpen={!!sliderProperty}
        onClose={() => setSliderProperty(null)}
        images={(sliderProperty?.media || []).map((m, i) => ({
          url: m.url,
          alt: `${sliderProperty?.title} - Foto ${i + 1}`,
          caption: sliderProperty?.title
        }))}
        initialIndex={sliderIndex}
        title={sliderProperty?.title}
      />

    </div>
  );
}

{/* CARD DE IMÓVEL INTERATIVO COM SLIDE DIRETO E LIGHTBOX */}
function CatalogPropertyCard({ 
  prop, 
  searchMode, 
  onOpenSlider 
}: { 
  prop: PropertyDTO; 
  searchMode: string; 
  onOpenSlider: (prop: PropertyDTO, index: number) => void;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = prop.media && prop.media.length > 0 
    ? prop.media 
    : [{ id: 'fallback', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', type: 'IMAGE' }];

  const currentPhoto = photos[photoIndex] || photos[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handleOpenSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenSlider(prop, photoIndex);
  };

  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm hover:shadow-xl overflow-hidden group flex flex-col justify-between transition-all">
      <div>
        {/* Imagem do Card com Slide Direto e Clique para Ampliar */}
        <div 
          onClick={handleOpenSlider}
          className="relative h-52 w-full bg-surface-hover overflow-hidden cursor-pointer group/photo"
          title="Clique para abrir galeria em slide"
        >
          <img 
            src={currentPhoto.url} 
            alt={prop.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
          />

          {/* Seta Esquerda (Slide direto no card) */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-brand-lime text-white hover:text-black flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md border border-white/20 active:scale-95"
              title="Foto anterior"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Seta Direita (Slide direto no card) */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-brand-lime text-white hover:text-black flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md border border-white/20 active:scale-95"
              title="Próxima foto"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Indicador de fotos no canto inferior */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold font-mono flex items-center gap-1 backdrop-blur-sm shadow z-10">
              <Camera className="w-3 h-3 text-brand-lime" />
              <span>{photoIndex + 1}/{photos.length}</span>
            </div>
          )}

          {/* Hover hint */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-sm flex items-center gap-1 shadow-lg border border-white/20">
              <Maximize2 className="w-3 h-3 text-brand-lime" /> Ver Slide
            </span>
          </div>

          {/* Badges de Venda / Aluguel */}
          <div className="absolute top-3 left-3 flex gap-2 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-lime text-white shadow">
              i7 {searchMode === 'buy' ? 'Venda' : 'Aluguel'}
            </span>
            {prop.furnished && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-text-primary backdrop-blur-md">
                Mobiliado
              </span>
            )}
          </div>
        </div>

        {/* Detalhes do Imóvel */}
        <Link href={`/imoveis/${prop.id}`} className="block p-4 space-y-2">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-brand-lime" /> {prop.neighborhood}, {prop.city}
          </div>
          <h4 className="text-base font-bold text-text-primary group-hover:text-brand-lime transition-colors line-clamp-2">
            {prop.title}
          </h4>
          <div className="flex items-center gap-3 text-[11px] font-bold text-text-secondary pt-1">
            <span>{prop.bedrooms} DORMS</span> • <span>{prop.bathrooms} BANH</span> • <span>{prop.areaSqm} M²</span>
          </div>
        </Link>
      </div>

      <div className="p-4 pt-0 border-t border-border mt-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            {searchMode === 'buy' ? 'Valor de Venda' : 'Aluguel + Taxas'}
          </span>
          <div className="text-lg font-extrabold text-brand-lime">
            R$ {(searchMode === 'buy' ? (prop.totalMonthly || prop.rentPrice) * 180 : (prop.totalMonthly || prop.rentPrice)).toLocaleString('pt-BR')}
          </div>
        </div>
        <Link 
          href={`/imoveis/${prop.id}`}
          className="p-2.5 rounded-xl bg-surface-hover text-brand-lime hover:bg-brand-lime hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

export default function SearchPropertiesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Carregando...</div>}>
      <SearchPropertiesContent />
    </Suspense>
  );
}
