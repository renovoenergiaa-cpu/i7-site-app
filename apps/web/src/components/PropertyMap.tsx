'use client';

import React, { useState, useEffect } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { PropertyDTO } from '@i7/types';
import Link from 'next/link';
import { X, MapPin } from 'lucide-react';

// Coordenadas da Sede Corporativa da i7 em Sorocaba (R. Cel. Nogueira Padilha, 374 - Vila Hortência)
const SOROCABA_DEFAULT_CENTER: [number, number] = [-23.5152, -47.4526];

interface PropertyMapProps {
  properties: PropertyDTO[];
  searchMode: 'buy' | 'rent' | 'sell';
  searchQuery?: string;
  searchTrigger?: number;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties, searchMode, searchQuery, searchTrigger }) => {
  const [center, setCenter] = useState<[number, number]>(SOROCABA_DEFAULT_CENTER);
  const [zoom, setZoom] = useState(13);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDTO | null>(null);

  // Função para obter as coordenadas reais e condicionadas do imóvel
  const getExactPropertyCoords = (prop: PropertyDTO, index: number): [number, number] => {
    if (
      typeof prop.latitude === 'number' && 
      typeof prop.longitude === 'number' && 
      !isNaN(prop.latitude) && 
      !isNaN(prop.longitude) &&
      prop.latitude !== 0 && 
      prop.longitude !== 0
    ) {
      return [prop.latitude, prop.longitude];
    }

    // Fallback condicionado em Sorocaba caso não haja coordenadas salvas
    const baseLat = -23.5152 + ((index % 5) * 0.006 - 0.012);
    const baseLng = -47.4526 + ((index % 4) * 0.006 - 0.010);
    return [baseLat, baseLng];
  };

  // Efeito para centralizar o mapa estritamente no local selecionado ou na média dos imóveis filtrados
  useEffect(() => {
    // 1. Se houver imóveis exibidos, centraliza no grupo de imóveis filtrados
    if (properties.length > 0) {
      const validCoords = properties.map((p, i) => getExactPropertyCoords(p, i));
      const avgLat = validCoords.reduce((acc, c) => acc + c[0], 0) / validCoords.length;
      const avgLng = validCoords.reduce((acc, c) => acc + c[1], 0) / validCoords.length;
      
      setCenter([avgLat, avgLng]);
      setZoom(properties.length === 1 ? 16 : 13);
      return;
    }

    // 2. Se não houver imóveis mas tiver busca textual, busca a coordenada da cidade/rua
    if (searchQuery && searchQuery.trim().length > 2) {
      const geocode = async () => {
        try {
          // Busca sem travar em São Paulo, permitindo Sorocaba, Votorantim ou qualquer cidade brasileira
          const query = searchQuery.toLowerCase().includes('brasil') 
            ? searchQuery 
            : `${searchQuery}, Brasil`;

          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
          const data = await response.json();

          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setCenter([lat, lng]);
            setZoom(14);
          }
        } catch (error) {
          console.error("Erro no Geocoding do mapa:", error);
        }
      };

      geocode();
    }
  }, [properties, searchQuery, searchTrigger]);

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-inner relative z-0" style={{ height: '650px', width: '100%' }}>
      <Map 
        center={center} 
        zoom={zoom} 
        onBoundsChanged={({ center, zoom }) => { 
          setCenter(center); 
          setZoom(zoom); 
        }}
      >
        {properties.map((prop, idx) => {
          const position = getExactPropertyCoords(prop, idx);
          const isSelected = selectedProperty?.id === prop.id;

          return (
            <Marker 
              key={prop.id}
              width={isSelected ? 46 : 38}
              anchor={position} 
              color={isSelected ? "#15803D" : "#65A30D"}
              onClick={() => setSelectedProperty(prop)} 
            />
          );
        })}

        {selectedProperty && (
          <Overlay 
            anchor={getExactPropertyCoords(
              selectedProperty, 
              properties.findIndex(p => p.id === selectedProperty.id)
            )} 
            offset={[110, 280]}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-border p-3.5 w-56 relative animate-in fade-in">
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedProperty(null); }}
                className="absolute -top-2.5 -right-2.5 bg-white border border-border text-text-secondary hover:text-red-500 rounded-full p-1 shadow-md z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2 bg-surface">
                <img 
                  src={selectedProperty.media?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'} 
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-brand-lime text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                  {selectedProperty.city || 'Sorocaba'}
                </div>
              </div>

              <div className="text-[10px] font-bold text-text-muted flex items-center gap-1 mb-0.5">
                <MapPin className="w-3 h-3 text-brand-lime shrink-0" />
                <span className="truncate">{selectedProperty.neighborhood}, {selectedProperty.city}</span>
              </div>

              <h4 className="text-xs font-bold text-text-primary line-clamp-1 mb-1">{selectedProperty.title}</h4>
              
              <div className="text-sm font-black text-brand-lime mb-2">
                R$ {(searchMode === 'buy' ? (selectedProperty.totalMonthly || selectedProperty.rentPrice) * 180 : (selectedProperty.totalMonthly || selectedProperty.rentPrice)).toLocaleString('pt-BR')}
                <span className="text-[10px] text-text-muted font-normal"> /mês</span>
              </div>

              <Link 
                href={`/imoveis/${selectedProperty.id}`}
                className="block text-center w-full py-2 bg-brand-lime text-white rounded-xl text-xs font-black hover:bg-brand-lime-hover shadow transition-all"
              >
                Ver Detalhes do Imóvel
              </Link>
            </div>
          </Overlay>
        )}
      </Map>
    </div>
  );
};
