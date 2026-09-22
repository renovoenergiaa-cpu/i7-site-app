import type { PropertyDTO } from '@i7/types';
import { getSharedProperties, getSharedProperty } from './supabaseProperties';
import { BuildingUnit, INITIAL_UNITS, getStoredData } from './gestaoData';

function getApprovedUnitsAsProperties(): PropertyDTO[] {
  if (typeof window === 'undefined') return [];
  try {
    const units = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    const approved = units.filter(u => u.status === 'DISPONIVEL');

    return approved.map((u, index) => {
      const hasCoords = typeof u.latitude === 'number' && typeof u.longitude === 'number' && !isNaN(u.latitude) && !isNaN(u.longitude) && u.latitude !== 0 && u.longitude !== 0;
      
      const exactLat = hasCoords ? u.latitude! : -23.5152 + ((index % 4) * 0.005);
      const exactLng = hasCoords ? u.longitude! : -47.4526 + ((index % 3) * 0.005);

      const resolvedTitle = u.title || (u.buildingName && u.unitNumber ? `${u.buildingName} - ${u.unitNumber}` : u.unitNumber || u.buildingName || 'Imóvel para Aluguel');
      const resolvedType = (u.type === 'APARTAMENTO' ? 'APARTMENT' : u.type === 'STUDIO' ? 'STUDIO' : u.type === 'CASA' ? 'HOUSE' : 'COMMERCIAL') as any;

      return {
        id: u.id,
        ownerId: 'owner-i7',
        title: resolvedTitle,
        description: u.description || (u.adminFeedback 
          ? `[Parecer i7]: ${u.adminFeedback}` 
          : `Imóvel avaliado e aprovado pela i7 em ${u.buildingName || u.neighborhood || 'Sorocaba'}. Excelente estado de conservação, com ${u.areaSqm}m², ${u.bedrooms || 1} quarto(s) e infraestrutura completa.`),
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
        rentPrice: u.rentValue,
        condoFee: u.condoValue,
        iptuFee: u.iptuValue,
        serviceFee: Math.round(u.rentValue * 0.08),
        totalMonthly: u.rentValue + u.condoValue + u.iptuValue + Math.round(u.rentValue * 0.08),
        bedrooms: u.bedrooms || 1,
        bathrooms: u.bathrooms || 1,
        parkingSpots: u.parkingSpaces || 0,
        areaSqm: u.areaSqm,
        furnished: u.furnished || false,
        petFriendly: u.petFriendly || true,
        hasVirtualTour: false,
        media: (u.photos && u.photos.length > 0)
          ? u.photos.map((url, i) => ({ id: `m-${u.id}-${i}`, propertyId: u.id, url, type: 'PHOTO' as const, order: i }))
          : [
              { id: `m-${u.id}-0`, propertyId: u.id, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000', type: 'PHOTO' as const, order: 0 }
            ],
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  } catch {
    return [];
  }
}

export async function fetchProperties(_params?: Record<string, unknown>): Promise<PropertyDTO[]> {
  try {
    const supabaseList = await getSharedProperties();
    if (supabaseList && supabaseList.length > 0) {
      return supabaseList;
    }
  } catch (err) {
    console.warn('Supabase properties fetch error, falling back to local gestao units:', err);
  }
  return getApprovedUnitsAsProperties();
}

export async function fetchPropertyById(id: string): Promise<PropertyDTO | null> {
  try {
    const sp = await getSharedProperty(id);
    if (sp) return sp;
  } catch {
    // fallback
  }
  const dynamicApproved = getApprovedUnitsAsProperties();
  const foundDynamic = dynamicApproved.find(p => p.id === id);
  if (foundDynamic) return foundDynamic;
  return null;
}

export const MOCK_PROPERTIES: PropertyDTO[] = [];
