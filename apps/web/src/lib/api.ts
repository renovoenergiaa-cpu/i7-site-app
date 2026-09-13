import type { PropertyDTO } from '@i7/types';
import { getSharedProperties, getSharedProperty } from './supabaseProperties';

export async function fetchProperties(_params?: Record<string, unknown>): Promise<PropertyDTO[]> {
  return getSharedProperties();
}

export async function fetchPropertyById(id: string): Promise<PropertyDTO> {
  return getSharedProperty(id);
}
