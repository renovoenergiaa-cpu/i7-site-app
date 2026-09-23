import type { PropertyDTO } from '@i7/types';
import { getSharedProperties, getSharedProperty, isDummyProperty } from './supabaseProperties';
import { BuildingUnit, INITIAL_UNITS, getStoredData, getFromIndexedDB } from './gestaoData';

export function unitToPropertyDTO(u: BuildingUnit, index: number = 0): PropertyDTO {
  const numLat = typeof u.latitude === 'string' ? parseFloat(u.latitude) : Number(u.latitude);
  const numLng = typeof u.longitude === 'string' ? parseFloat(u.longitude) : Number(u.longitude);
  const hasCoords = !isNaN(numLat) && !isNaN(numLng) && numLat !== 0 && numLng !== 0;

  // Centro de Sorocaba / Região Campolim e Vila Hortência
  const exactLat = hasCoords ? numLat : -23.5152 + ((index % 5) * 0.005 - 0.010);
  const exactLng = hasCoords ? numLng : -47.4526 + ((index % 4) * 0.005 - 0.008);

  const resolvedTitle = u.title || (u.buildingName && u.unitNumber ? `${u.buildingName} - ${u.unitNumber}` : u.unitNumber || u.buildingName || 'Imóvel para Aluguel');
  
  const rawType = (u.type || '').toUpperCase();
  const resolvedType = (
    rawType === 'APARTAMENTO' || rawType === 'APARTMENT' ? 'APARTMENT' :
    rawType === 'STUDIO' ? 'STUDIO' :
    rawType === 'CASA' || rawType === 'HOUSE' ? 'HOUSE' :
    'COMMERCIAL'
  ) as any;

  const rentVal = Number(u.rentValue) || 0;
  const condoVal = Number(u.condoValue) || 0;
  const adminOrIptuVal = Number(u.adminFeeValue ?? u.iptuValue ?? 0);

  return {
    id: u.id,
    ownerId: 'owner-i7',
    title: resolvedTitle,
    description: u.description || (u.adminFeedback 
      ? `[Parecer i7]: ${u.adminFeedback}` 
      : `Imóvel avaliado e aprovado pela i7 em ${u.buildingName || u.neighborhood || 'Sorocaba'}. Excelente estado de conservação, com ${u.areaSqm || 50}m², ${u.bedrooms ?? 0} quarto(s) e infraestrutura completa.`),
    type: resolvedType,
    status: 'PUBLISHED' as any,
    street: u.street || u.address || u.buildingName || 'Rua Principal',
    number: u.number || '100',
    complement: u.complement,
    neighborhood: u.neighborhood || 'Parque Campolim',
    city: u.city || 'Sorocaba',
    state: u.state || 'SP',
    zipCode: u.zipCode || '18000-000',
    latitude: exactLat,
    longitude: exactLng,
    rentPrice: rentVal,
    condoFee: condoVal,
    iptuFee: adminOrIptuVal,
    serviceFee: 0,
    totalMonthly: rentVal + condoVal + adminOrIptuVal,
    bedrooms: typeof u.bedrooms === 'number' ? u.bedrooms : (u.bedrooms !== undefined && u.bedrooms !== null ? Number(u.bedrooms) : 0),
    bathrooms: typeof u.bathrooms === 'number' ? u.bathrooms : (u.bathrooms !== undefined && u.bathrooms !== null ? Number(u.bathrooms) : 1),
    parkingSpots: typeof u.parkingSpaces === 'number' ? u.parkingSpaces : (u.parkingSpaces !== undefined && u.parkingSpaces !== null ? Number(u.parkingSpaces) : 0),
    areaSqm: Number(u.areaSqm) || 50,
    furnished: Boolean(u.furnished),
    petFriendly: u.petFriendly !== false,
    hasVirtualTour: false,
    media: (u.photos && u.photos.length > 0)
      ? u.photos.map((url, i) => ({ id: `m-${u.id}-${i}`, propertyId: u.id, url, type: 'PHOTO' as const, order: i }))
      : [
          { id: `m-${u.id}-0`, propertyId: u.id, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000', type: 'PHOTO' as const, order: 0 }
        ],
    createdAt: u.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function getAllLocalUnits(): BuildingUnit[] {
  if (typeof window === 'undefined') return INITIAL_UNITS;
  try {
    const rawGestao = localStorage.getItem('i7_gestao_units');
    if (rawGestao) {
      const parsed = JSON.parse(rawGestao);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const rawPlain = localStorage.getItem('units');
    if (rawPlain) {
      const parsed = JSON.parse(rawPlain);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const stored = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    return INITIAL_UNITS;
  } catch {
    return INITIAL_UNITS;
  }
}

export async function fetchProperties(_params?: Record<string, unknown>): Promise<PropertyDTO[]> {
  const result: PropertyDTO[] = [];
  const seenIds = new Set<string>();

  // 1. Tenta carregar da rota de API de servidor compartilhada
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/properties');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.properties)) {
          data.properties.forEach((p: PropertyDTO) => {
            if (!isDummyProperty(p) && !seenIds.has(p.id)) {
              seenIds.add(p.id);
              result.push(p);
            }
          });
        }
      }
    } catch {
      // continua
    }
  }

  // 2. Busca do Supabase compartilhado oficial
  try {
    const supabaseList = await getSharedProperties();
    if (supabaseList && supabaseList.length > 0) {
      supabaseList.forEach(p => {
        if (!isDummyProperty(p) && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          result.push(p);
        }
      });
    }
  } catch (err) {
    console.warn('Supabase properties fetch error:', err);
  }

  // 3. Carrega todas as unidades cadastradas localmente e de INITIAL_UNITS
  const localUnits = getAllLocalUnits();
  const approved = localUnits.filter(u => u.status === 'DISPONIVEL' || (u.status as any) === 'PUBLISHED');
  approved.forEach((u, i) => {
    if (!seenIds.has(u.id)) {
      seenIds.add(u.id);
      result.push(unitToPropertyDTO(u, i));
    }
  });

  return result;
}

export async function fetchPropertyById(id: string): Promise<PropertyDTO | null> {
  if (!id) return null;
  const targetId = decodeURIComponent(id).trim().toLowerCase();

  // 1. Procura primeiro nas unidades locais (localStorage síncrono)
  const localUnits = getAllLocalUnits();
  let foundLocal = localUnits.find(u => {
    const uId = String(u.id || '').toLowerCase();
    const uTitle = String(u.title || '').toLowerCase();
    const uUnit = String(u.unitNumber || '').toLowerCase();
    const uBuilding = String(u.buildingName || '').toLowerCase();
    const combined = `${uBuilding} - ${uUnit}`.toLowerCase();

    return uId === targetId || uTitle === targetId || uUnit === targetId || combined === targetId || targetId.includes(uId) || uId.includes(targetId);
  });

  // 2. Se não encontrou no localStorage síncrono, busca no IndexedDB (que armazena fotos e dados sem limite de 5MB)
  if (!foundLocal && typeof window !== 'undefined') {
    try {
      const idbUnits = await getFromIndexedDB<BuildingUnit[]>('units');
      if (Array.isArray(idbUnits)) {
        foundLocal = idbUnits.find(u => {
          const uId = String(u.id || '').toLowerCase();
          const uTitle = String(u.title || '').toLowerCase();
          const uUnit = String(u.unitNumber || '').toLowerCase();
          const uBuilding = String(u.buildingName || '').toLowerCase();
          const combined = `${uBuilding} - ${uUnit}`.toLowerCase();
          return uId === targetId || uTitle === targetId || uUnit === targetId || combined === targetId || targetId.includes(uId) || uId.includes(targetId);
        });
      }
    } catch {
      // continua
    }
  }

  if (foundLocal) {
    const idx = (localUnits || []).indexOf(foundLocal);
    return unitToPropertyDTO(foundLocal, idx >= 0 ? idx : 0);
  }

  // 3. Procura na API de servidor compartilhada
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/properties');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.properties)) {
          const found = data.properties.find((p: PropertyDTO) => 
            String(p.id || '').toLowerCase() === targetId ||
            String(p.title || '').toLowerCase() === targetId ||
            targetId.includes(String(p.id || '').toLowerCase())
          );
          if (found && !isDummyProperty(found)) {
            return found;
          }
        }
      }
    } catch {
      // continua
    }
  }

  // 4. Procura no Supabase
  try {
    const sp = await getSharedProperty(targetId);
    if (sp && !isDummyProperty(sp)) {
      return sp;
    }
  } catch {
    // Silencia se não encontrado
  }

  return null;
}

export const MOCK_PROPERTIES: PropertyDTO[] = [];
