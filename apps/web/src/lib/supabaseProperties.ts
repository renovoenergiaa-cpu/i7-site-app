import type { PropertyDTO, PropertyMediaDTO } from '@i7/types';
import { supabase } from './supabase';

export function isDummyProperty(p: PropertyDTO | any): boolean {
  if (!p) return true;
  const id = String(p.id || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  const desc = (p.description || '').toLowerCase();
  const street = (p.street || '').toLowerCase();
  const neighborhood = (p.neighborhood || '').toLowerCase();

  // Filtra o exemplo antigo 'Apto 31' e mocks legados
  if (id === 'b3106524-17ad-4a9b-a6fa-e9fa93637c31') return true;
  if (id.startsWith('prop-') || id.startsWith('mock-') || id.startsWith('sample-')) return true;
  if (title === 'apto 31' || title.includes('studio high-tech') || title.includes('itaim bibi') || title.includes('exemplo')) return true;
  if (street.includes('mangal gourmet') || desc.includes('mangal gourmet') || neighborhood.includes('mangal gourmet')) return true;
  if (street.includes('rua dos pinheiros') || street.includes('joaquim floriano')) return true;
  return false;
}

type Row = Record<string, any> & { property_media?: Record<string, any>[] };
const map = (row: Row): PropertyDTO => {
  const rent = Number(row.rent_price) || 0;
  const condo = Number(row.condo_fee) || 0;
  const iptu = Number(row.iptu_fee) || 0;
  const service = Number(row.service_fee) || 0;

  return {
    id: row.id,
    ownerId: row.owner_id || 'owner-i7',
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    street: row.street,
    number: row.number,
    complement: row.complement ?? undefined,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    latitude: typeof row.latitude === 'number' && !isNaN(row.latitude) && row.latitude !== 0 ? row.latitude : -23.5152,
    longitude: typeof row.longitude === 'number' && !isNaN(row.longitude) && row.longitude !== 0 ? row.longitude : -47.4526,
    rentPrice: rent,
    salePrice: row.sale_price == null ? undefined : Number(row.sale_price),
    condoFee: condo,
    iptuFee: iptu,
    serviceFee: service,
    totalMonthly: rent + condo + iptu + service,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parkingSpots: row.parking_spots,
    areaSqm: Number(row.area_sqm),
    furnished: row.furnished,
    petFriendly: row.pet_friendly,
    hasVirtualTour: Boolean(row.virtual_tour_url),
    virtualTourUrl: row.virtual_tour_url ?? undefined,
    media: (row.property_media ?? []).map((m): PropertyMediaDTO => ({ id: m.id, propertyId: m.property_id, url: m.url, type: m.type, order: m.sort_order })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export async function getSharedProperties(): Promise<PropertyDTO[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, property_media(*)')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch properties error:', error);
      return [];
    }
    const rows = (data as Row[]) || [];
    return rows.map(map).filter(p => !isDummyProperty(p));
  } catch (err) {
    console.warn('Supabase error:', err);
    return [];
  }
}

export async function getSharedProperty(id: string): Promise<PropertyDTO | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, property_media(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    const prop = map(data as Row);
    return isDummyProperty(prop) ? null : prop;
  } catch {
    return null;
  }
}
