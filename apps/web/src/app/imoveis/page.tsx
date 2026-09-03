'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Filter, Grid, Map as MapIcon, Heart, Check, SlidersHorizontal, Sparkles, Building2, ArrowRight } from 'lucide-react';
import { fetchProperties } from '@/lib/api';
import { PropertyDTO } from '@i7/types';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { PropertyMap } from '@/components/PropertyMap';

function SearchPropertiesContent() {
  const searchParams = useSearchParams();
  const initMode = searchParams.get('mode') || 'rent';
  const initNeighborhood = searchParams.get('neighborhood') || '';
  const initType = searchParams.get('type') || '';

  const [properties, setProperties] = useState<PropertyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Filter States
  const [searchNeighborhood, setSearchNeighborhood] = useState(initNeighborhood);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(initNeighborhood); // Usado para o mapa
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [selectedType, setSelectedType] = useState(initType);
  const [searchMode, setSearchMode] = useState(initMode); // 'buy' | 'rent'
  const [maxPrice, setMaxPrice] = useState(initMode === 'buy' ? 3000000 : 15000);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [parking, setParking] = useState<number | null>(null);
  const [petFriendly, setPetFriendly] = useState(false);
  const [furnished, setFurnished] = useState(false);

  useEffect(() => {
    fetchProperties().then(data => {
      setProperties(data);
      setLoading(false);
    });
  }, []);

  const filteredProperties = properties.filter(p => {
    // Mock prices based on searchMode
    const priceToCompare = searchMode === 'buy' ? p.rentPrice * 180 : p.rentPrice; // Mocking sale price
    
    // Check location (matching street, neighborhood, city and title)
    if (searchNeighborhood) {
      const searchTerms = searchNeighborhood.toLowerCase().split(/[,-]/).map(t => t.trim()).filter(Boolean);
      const matchesLocation = searchTerms.some(term => 
        (p.city && p.city.toLowerCase().includes(term)) ||
        (p.neighborhood && p.neighborhood.toLowerCase().includes(term)) ||
        (p.street && p.street.toLowerCase().includes(term)) ||
        (p.title && p.title.toLowerCase().includes(term))
      );
      if (!matchesLocation) return false;
    }

    if (selectedType && p.type !== selectedType) return false;
    if (priceToCompare > maxPrice) return false;
    if (bedrooms && p.bedrooms < bedrooms) return false;
    if (bathrooms && p.bathrooms < bathrooms) return false;
    
    // Mock parking spots: 2 for houses, 1 for others
    const propParking = p.type === 'HOUSE' ? 2 : 1;
    if (parking && propParking < parking) return false;
    
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
                onClick={() => { setSearchMode('rent'); setMaxPrice(15000); }}
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
              max={searchMode === 'buy' ? 5000000 : 25000} 
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
                <div className="col-span-full py-20 text-center text-text-muted">
                  Nenhum imóvel encontrado com estes filtros.
                </div>
              ) : (
                filteredProperties.map(prop => (
                  <div key={prop.id} className="rounded-2xl bg-white border border-border shadow-sm hover:shadow-xl overflow-hidden group flex flex-col justify-between transition-all">
                    <div>
                      <div className="relative h-48 w-full bg-surface-hover overflow-hidden">
                        <img 
                          src={prop.media[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'} 
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-lime text-white shadow">
                            i7 {searchMode === 'buy' ? 'Venda' : 'Aluguel'}
                          </span>
                          {prop.furnished && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-text-primary backdrop-blur-md">
                              Mobiliado
                            </span>
                          )}
                        </div>
                        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 text-text-secondary hover:text-red-500 hover:bg-white transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-[11px] font-medium text-text-muted flex items-center gap-1 uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5 text-brand-lime" /> {prop.neighborhood}, {prop.city}
                        </div>
                        <h4 className="text-base font-bold text-text-primary group-hover:text-brand-lime transition-colors line-clamp-2">
                          {prop.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-text-secondary pt-1">
                          <span>{prop.bedrooms} DORMS</span> • <span>{prop.bathrooms} BANH</span> • <span>{prop.areaSqm} M²</span>
                        </div>
                      </div>
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
