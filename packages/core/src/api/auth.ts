import { coreFetch } from './client';
import type { LoginDTO, RegisterDTO, AuthResponseDTO, VerifyEmailDTO } from '@i7/types';

export const login = async (data: LoginDTO): Promise<AuthResponseDTO> => {
  return coreFetch<AuthResponseDTO>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const registerUser = async (data: RegisterDTO): Promise<{ message: string; email: string }> => {
  return coreFetch<{ message: string; email: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const verifyEmail = async (data: VerifyEmailDTO): Promise<AuthResponseDTO> => {
  return coreFetch<AuthResponseDTO>('/auth/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getProfile = async (): Promise<any> => {
  return coreFetch('/auth/profile');
};

