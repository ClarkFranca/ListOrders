const BASE_URL = 'http://localhost:5000/api';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro na API: ${response.status}`);
  }

  if (response.status === 201 || response.status === 204) {
    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }

  return response.json();
}
