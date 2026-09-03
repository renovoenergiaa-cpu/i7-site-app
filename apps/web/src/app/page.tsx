'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Building, ShieldCheck, Sparkles, KeyRound, ArrowRight, Heart, Calendar } from 'lucide-react';
import { fetchProperties } from '@/lib/api';
import { PropertyDTO } from '@i7/types';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { useFavorites } from '@/lib/useFavorites';

export default function HomePage() {
  const [properties, setProperties] = useState<PropertyDTO[]>([]);
  const [searchCity, setSearchCity] = useState('São Paulo');
  const [searchNeighborhood, setSearchNeighborhood] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchMode, setSearchMode] = useState<'buy' | 'rent' | 'sell'>('rent');
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchProperties().then(data => setProperties(data));
  }, []);

  return (
    <div className="space-y-20 pb-16 bg-background">
      
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-border">
        
        {/* Hero Background Image */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80" 
            alt="Interior de imóvel moderno" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-black/40" /> {/* Dark overlay for text readability */}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center mt-10">
          <div className="text-center max-w-4xl mx-auto space-y-4 mb-10">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black font-sans tracking-tight text-white leading-tight drop-shadow-md">
              Encontre o imóvel dos seus sonhos
            </h1>
            <p className="text-lg text-white/90 font-medium drop-shadow-sm max-w-2xl mx-auto">
              A melhor plataforma para comprar, alugar e viver bem. Sem burocracia e 100% digital.
            </p>
          </div>

          {/* SEARCH CARD (RE/MAX Style) */}
          <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden mt-6">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button 
                onClick={() => setSearchMode('buy')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${searchMode === 'buy' ? 'text-brand-lime border-b-2 border-brand-lime bg-blue-50/50' : 'text-text-muted hover:bg-surface-hover hover:text-text-primary'}`}
              >
                Comprar
              </button>
              <button 
                onClick={() => setSearchMode('rent')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${searchMode === 'rent' ? 'text-brand-lime border-b-2 border-brand-lime bg-blue-50/50' : 'text-text-muted hover:bg-surface-hover hover:text-text-primary'}`}
              >
                Alugar
              </button>
              <button 
                onClick={() => setSearchMode('sell')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${searchMode === 'sell' ? 'text-brand-lime border-b-2 border-brand-lime bg-brand-lime/10' : 'text-text-muted hover:bg-surface-hover hover:text-text-primary'}`}
              >
                Vender
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {searchMode === 'sell' ? (
                <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                    Venda seu imóvel mais rápido e com segurança
                  </h2>
                  <p className="text-text-secondary max-w-lg">
                    Conectamos seu imóvel a milhares de compradores interessados, cuidamos das fotos, avaliação e garantimos a documentação ágil.
                  </p>
                  <Link
                    href="/vender"
                    className="py-4 px-8 rounded-xl font-bold bg-brand-lime text-white hover:bg-brand-lime-hover shadow-lg shadow-brand-lime/30 text-lg transition-all transform hover:scale-105"
                  >
                    Anunciar meu imóvel agora
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* City / Neighborhood Input */}
                    <div className="md:col-span-6 flex items-end">
                      <AddressAutocomplete 
                        value={searchNeighborhood}
                        onChange={setSearchNeighborhood}
                        placeholder="Digite a rua, bairro ou cidade..."
                      />
                    </div>

                    {/* Property Type Selector */}
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-brand-lime" /> Tipo
                      </label>
                      <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-surface-hover border border-border focus:border-brand-lime rounded-xl px-4 py-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20 transition-all"
                      >
                        <option value="">Todos os tipos</option>
                        <option value="APARTMENT">Apartamento</option>
                        <option value="STUDIO">Studio</option>
                        <option value="HOUSE">Casa</option>
                        <option value="COMMERCIAL">Comercial</option>
                      </select>
                    </div>

                    {/* Search Submit Button */}
                    <div className="md:col-span-3 flex items-end">
                      <Link
                        href={`/imoveis?mode=${searchMode}&neighborhood=${encodeURIComponent(searchNeighborhood)}&type=${selectedType}`}
                        className="w-full py-3.5 px-6 rounded-xl font-bold bg-brand-lime text-white hover:bg-brand-lime-hover shadow-lg shadow-brand-lime/30 flex items-center justify-center gap-2 transition-all"
                      >
                        <Search className="w-5 h-5" />
                        Buscar
                      </Link>
                    </div>

                  </div>

                  {/* Quick Filters */}
                  <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className="text-text-muted">Populares:</span>
                    <Link href="/imoveis?neighborhood=Pinheiros" className="px-3 py-1.5 rounded-full bg-surface-hover text-text-primary hover:bg-border transition-colors">
                      Pinheiros
                    </Link>
                    <Link href="/imoveis?neighborhood=Itaim+Bibi" className="px-3 py-1.5 rounded-full bg-surface-hover text-text-primary hover:bg-border transition-colors">
                      Itaim Bibi
                    </Link>
                    <Link href="/imoveis?type=STUDIO" className="px-3 py-1.5 rounded-full bg-surface-hover text-text-primary hover:bg-border transition-colors">
                      Studios
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* METRICS & DIFFERENTIALS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="p-8 rounded-3xl glass-card flex flex-col items-center text-center border border-border/60 hover:border-brand-lime/30 transition-all shadow-sm">
            <div className="w-16 h-16 rounded-full bg-lime-50 flex items-center justify-center text-lime-600 mb-6 shadow-inner">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Visitas Presenciais</h3>
            <p className="text-base text-text-secondary mt-3 leading-relaxed">Agendamento ágil com corretor credenciado e atendimento exclusivo no local.</p>
          </div>

          <div className="p-8 rounded-3xl glass-card flex flex-col items-center text-center border border-border/60 hover:border-brand-lime/30 transition-all shadow-sm">
            <div className="w-16 h-16 rounded-full bg-lime-50 flex items-center justify-center text-lime-600 mb-6 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Processo Ágil</h3>
            <p className="text-base text-text-secondary mt-3 leading-relaxed">Assinatura eletrônica e fechamento de contrato em tempo recorde.</p>
          </div>

        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-text-primary">Imóveis em Destaque</h2>
            <p className="text-text-secondary mt-1">As melhores oportunidades selecionadas para você</p>
          </div>
          <Link href="/imoveis" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-surface-hover text-text-primary hover:bg-border transition-colors flex items-center gap-2">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.slice(0, 3).map((prop) => (
            <div key={prop.id} className="rounded-2xl glass-card overflow-hidden group flex flex-col h-full">
              
              {/* Photo Thumbnail */}
              <div className="relative h-64 w-full bg-surface-hover overflow-hidden">
                <img 
                  src={prop.media[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'} 
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-brand-lime text-white shadow-md">
                    Para Alugar
                  </span>
                  {prop.petFriendly && (
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-white text-text-primary shadow-sm">
                      Pet Friendly
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => toggleFavorite(prop)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 text-text-muted hover:text-red-500 hover:bg-white shadow-sm transition-all"
                >
                  <Heart className={`w-4 h-4 ${isFavorite(prop.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>

              {/* Property Details */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {prop.neighborhood}, {prop.city}
                </div>
                <h3 className="text-lg font-bold text-text-primary line-clamp-2 mb-4 group-hover:text-brand-lime transition-colors">
                  {prop.title}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-text-secondary mb-6">
                  <span><strong>{prop.bedrooms}</strong> quartos</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span><strong>{prop.bathrooms}</strong> banheiros</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span><strong>{prop.areaSqm}</strong> m²</span>
                </div>

                <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
                  <div>
                    <span className="text-xs text-text-muted block mb-0.5">Aluguel:</span>
                    <div className="text-2xl font-black text-brand-lime">
                      R$ {prop.totalMonthly?.toLocaleString('pt-BR')} <span className="text-sm font-normal text-text-secondary">/mês</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
