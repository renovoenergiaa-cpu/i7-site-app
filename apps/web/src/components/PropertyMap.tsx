'use client';

import React, { useState, useEffect } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { PropertyDTO } from '@i7/types';
import Link from 'next/link';
import { X } from 'lucide-react';

const defaultCenter: [number, number] = [-23.55052, -46.633309];

interface PropertyMapProps {
  properties: PropertyDTO[];
  searchMode: 'buy' | 'rent' | 'sell';
  searchQuery?: string;
  searchTrigger?: number;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties, searchMode, searchQuery, searchTrigger }) => {
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(13);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDTO | null>(null);

  // Efeito para centralizar o mapa quando a busca mudar
  useEffect(() => {
    if (!searchQuery) {
      setCenter(defaultCenter);
      setZoom(13);
      return;
    }

    const geocode = async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', São Paulo, Brasil')}&format=json&limit=1`);
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          
          setCenter([lat, lng]);
          setZoom(15);
        } else {
          alert('Não encontramos essa localização exata. Tente digitar o nome da rua ou bairro com mais detalhes.');
        }
      } catch (error) {
        console.error("Erro no Geocoding:", error);
      }
    };
    
    geocode();
  }, [searchQuery, searchTrigger]);

  const getMockCoords = (id: string, index: number): [number, number] => {
    const jitterLat = (index * 0.005) * (index % 2 === 0 ? 1 : -1);
    const jitterLng = (index * 0.005) * (index % 3 === 0 ? 1 : -1);
    return [
      defaultCenter[0] + jitterLat,
      defaultCenter[1] + jitterLng,
    ];
  };

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
          const position = getMockCoords(prop.id, idx);
          return (
            <Marker 
              key={prop.id}
              width={40}
              anchor={position} 
              color="#65A30D"
              onClick={() => setSelectedProperty(prop)} 
            />
          );
        })}

        {selectedProperty && (
          <Overlay anchor={getMockCoords(selectedProperty.id, properties.findIndex(p => p.id === selectedProperty.id))} offset={[96, 260]}>
            <div className="bg-surface rounded-xl shadow-2xl border border-border p-3 w-48 relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedProperty(null); }}
                className="absolute -top-3 -right-3 bg-white border border-border text-text-secondary hover:text-red-500 rounded-full p-1.5 shadow-md z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <img 
                src={selectedProperty.media?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'} 
                alt={selectedProperty.title}
                className="w-full h-28 object-cover rounded-lg mb-2"
              />
              <div className="text-[10px] text-text-muted mb-1">{selectedProperty.neighborhood}</div>
              <h4 className="text-xs font-bold text-text-primary line-clamp-1 mb-1">{selectedProperty.title}</h4>
              <div className="text-sm font-black text-brand-lime mb-2">
                R$ {(searchMode === 'buy' ? (selectedProperty.totalMonthly || selectedProperty.rentPrice) * 180 : (selectedProperty.totalMonthly || selectedProperty.rentPrice)).toLocaleString('pt-BR')}
              </div>
              <Link 
                href={`/imoveis/${selectedProperty.id}`}
                className="block text-center w-full py-2 bg-brand-lime text-white rounded-lg text-xs font-bold hover:bg-brand-lime-hover shadow-md transition-colors"
              >
                Ver Imóvel
              </Link>
            </div>
          </Overlay>
        )}
      </Map>
    </div>
  );
};
