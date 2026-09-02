'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    postcode?: string;
  };
}

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (addressData: NominatimResult) => void;
}

export function AddressAutocomplete({ 
  label = "Localização", 
  placeholder = "Digite a rua, bairro ou cidade...", 
  value, 
  onChange,
  onSelect 
}: AddressAutocompleteProps) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside to close dropdown
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (!value || value.length < 4) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&countrycodes=br&format=json&addressdetails=1&limit=5`, {
          headers: {
            'Accept-Language': 'pt-BR'
          }
        });
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setIsLoading(false);
      }
    }, 600); // Debounce 600ms

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (item: NominatimResult) => {
    // Format a friendly display name instead of the huge nominatim display_name
    let friendlyName = '';
    if (item.address.road) friendlyName += item.address.road;
    if (item.address.suburb) friendlyName += friendlyName ? `, ${item.address.suburb}` : item.address.suburb;
    if (item.address.city || item.address.town) {
      const city = item.address.city || item.address.town;
      friendlyName += friendlyName ? ` - ${city}` : city;
    }
    if (!friendlyName) friendlyName = item.display_name;

    onChange(friendlyName);
    if (onSelect) onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5 relative w-full" ref={wrapperRef}>
      {label && (
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-lime" /> {label}
        </label>
      )}
      
      <div className="relative">
        <input 
          type="text" 
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="w-full bg-surface-hover border border-border focus:border-brand-lime rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-lime/20 transition-all pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map((item) => (
            <li 
              key={item.place_id} 
              onClick={() => handleSelect(item)}
              className="px-4 py-3 text-sm text-text-primary hover:bg-surface-hover cursor-pointer transition-colors border-b border-border last:border-0 flex items-start gap-2"
            >
              <MapPin className="w-4 h-4 text-brand-lime mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold">{item.address.road || item.address.suburb || item.display_name.split(',')[0]}</span>
                <span className="text-xs text-text-muted">
                  {[item.address.suburb, item.address.city || item.address.town, item.address.state].filter(Boolean).join(', ')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && !isLoading && value.length >= 4 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-xl shadow-xl p-4 text-sm text-text-muted text-center">
          Nenhum endereço encontrado.
        </div>
      )}
    </div>
  );
}
