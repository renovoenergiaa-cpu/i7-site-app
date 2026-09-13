import type { PropertyDTO, PropertyMediaDTO } from '@i7/types';
import { supabase } from './supabase';

type Row = Record<string, any> & { property_media?: Record<string, any>[] };
const map = (row: Row): PropertyDTO => ({
  id: row.id, ownerId: row.owner_id, title: row.title, description: row.description,
  type: row.type, status: row.status, street: row.street, number: row.number,
  complement: row.complement ?? undefined, neighborhood: row.neighborhood, city: row.city,
  state: row.state, zipCode: row.zip_code, latitude: row.latitude ?? 0, longitude: row.longitude ?? 0,
  rentPrice: Number(row.rent_price), salePrice: row.sale_price == null ? undefined : Number(row.sale_price),
  condoFee: Number(row.condo_fee), iptuFee: Number(row.iptu_fee), serviceFee: Number(row.service_fee),
  totalMonthly: Number(row.rent_price) + Number(row.condo_fee) + Number(row.iptu_fee) + Number(row.service_fee),
  bedrooms: row.bedrooms, bathrooms: row.bathrooms, parkingSpots: row.parking_spots, areaSqm: Number(row.area_sqm),
  furnished: row.furnished, petFriendly: row.pet_friendly, hasVirtualTour: Boolean(row.virtual_tour_url), virtualTourUrl: row.virtual_tour_url ?? undefined,
  media: (row.property_media ?? []).map((m): PropertyMediaDTO => ({ id:m.id, propertyId:m.property_id, url:m.url, type:m.type, order:m.sort_order })),
  createdAt: row.created_at, updatedAt: row.updated_at,
});
export async function getSharedProperties(): Promise<PropertyDTO[]> {
  const { data, error } = await supabase.from('properties').select('*, property_media(*)').eq('status','PUBLISHED').order('created_at',{ascending:false});
  if (error) throw error; return (data as Row[]).map(map);
}
export async function getSharedProperty(id: string): Promise<PropertyDTO> {
  const { data, error } = await supabase.from('properties').select('*, property_media(*)').eq('id',id).single();
  if (error) throw error; return map(data as Row);
}
