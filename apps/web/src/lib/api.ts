import type { PropertyDTO } from '@i7/types';
import { getSharedProperties, getSharedProperty, isDummyProperty } from './supabaseProperties';
import { BuildingUnit, INITIAL_UNITS, getStoredData } from './gestaoData';

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
      : `Imóvel avaliado e aprovado pela i7 em ${u.buildingName || u.neighborhood || 'Sorocaba'}. Excelente estado de conservação, com ${u.areaSqm || 50}m², ${u.bedrooms || 1} quarto(s) e infraestrutura completa.`),
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
    bedrooms: Number(u.bedrooms) || 1,
    bathrooms: Number(u.bathrooms) || 1,
    parkingSpots: Number(u.parkingSpaces) || 0,
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
  if (typeof window === 'undefined') return [];
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
    return getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
  } catch {
    return [];
  }
}

export async function fetchProperties(_params?: Record<string, unknown>): Promise<PropertyDTO[]> {
  const result: PropertyDTO[] = [];
  const seenIds = new Set<string>();

  // 1. Carrega todas as unidades aprovadas/disponíveis cadastradas localmente
  const localUnits = getAllLocalUnits();
  const approved = localUnits.filter(u => u.status === 'DISPONIVEL');
  approved.forEach((u, i) => {
    if (!seenIds.has(u.id)) {
      seenIds.add(u.id);
      result.push(unitToPropertyDTO(u, i));
    }
  });

  // 2. Busca também do Supabase compartilhado (filtrando qualquer mock ou exemplo legado)
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

  return result;
}

export async function fetchPropertyById(id: string): Promise<PropertyDTO | null> {
  if (!id) return null;
  const targetId = decodeURIComponent(id).trim();

  // 1. Procura primeiro nas unidades locais (independente do status, permitindo ver no site imediato)
  const localUnits = getAllLocalUnits();
  const foundLocal = localUnits.find(u => 
    String(u.id).toLowerCase() === targetId.toLowerCase() ||
    (u.title && u.title.toLowerCase() === targetId.toLowerCase())
  );
  if (foundLocal) {
    const idx = localUnits.indexOf(foundLocal);
    return unitToPropertyDTO(foundLocal, idx);
  }

  // 2. Procura no Supabase
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
