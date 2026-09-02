import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, getProfile, configureApiClient } from '@i7/core';
import type { LoginDTO } from '@i7/types';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: (data: LoginDTO) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

// Configuração do IP local (importante para rodar no celular físico apontando para o PC)
// Substitua pelo IP da sua máquina se for rodar no celular físico
const LOCAL_API_URL = 'http://192.168.0.75:4000/api'; 
configureApiClient({ baseURL: LOCAL_API_URL });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redireciona para o login se não estiver logado
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redireciona para o app se já estiver logado
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  const loadSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('i7_token');
      if (token) {
        configureApiClient({ token });
        const profile = await getProfile();
        setUser(profile.user);
      }
    } catch (e) {
      console.log('Sessão expirada ou inválida', e);
      await SecureStore.deleteItemAsync('i7_token');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: LoginDTO) => {
    const response = await apiLogin(data);
    await SecureStore.setItemAsync('i7_token', response.accessToken);
    configureApiClient({ token: response.accessToken });
    setUser(response.user);
    router.replace('/(tabs)');
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('i7_token');
    configureApiClient({ token: null });
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
