// Lightweight native fetch client shared between Web and Mobile (React Native)

let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
let authToken: string | null = null;

export const configureApiClient = (config: { baseURL?: string; token?: string | null }) => {
  if (config.baseURL) {
    baseURL = config.baseURL;
  }
  if (config.token !== undefined) {
    authToken = config.token;
  }
};

export const coreFetch = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: any = new Error(data.message || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
};
