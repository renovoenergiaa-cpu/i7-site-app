import { coreFetch } from './client';
import type { PropertyDTO } from '@i7/types';

export const getProperties = async (): Promise<PropertyDTO[]> => {
  return coreFetch<PropertyDTO[]>('/properties');
};

export const getPropertyById = async (id: string): Promise<PropertyDTO> => {
  return coreFetch<PropertyDTO>(`/properties/${id}`);
};
