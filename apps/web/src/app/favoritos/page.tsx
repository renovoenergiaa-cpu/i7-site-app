'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, ArrowLeft } from 'lucide-react';
import { useFavorites } from '@/lib/useFavorites';

export default function FavoritesPage() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <div className="min-h-screen bg-background pb-16 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-xl bg-surface-hover text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary">Meus Favoritos</h1>
            <p className="text-text-secondary mt-1">Imóveis que você salvou para ver depois.</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl border border-border/50">
            <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Nenhum imóvel salvo ainda</h2>
            <p className="text-text-secondary max-w-md mt-2 mb-8">
              Você ainda não marcou nenhum imóvel como favorito. Volte para a busca e clique no coração para salvar os que você mais gostar.
            </p>
            <Link href="/" className="px-6 py-3 rounded-xl font-bold bg-brand-lime text-white hover:bg-brand-lime-hover shadow-lg shadow-brand-lime/30 transition-all">
              Buscar Imóveis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((prop) => (
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
                    <Link href={`/imoveis/${prop.id}`} className="text-sm font-bold text-brand-lime hover:underline">
                      Ver detalhes
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
