// base-url.ts
export const BASE_URL = 'http://localhost:8080';

export function getAuthHeaders(): { headers: { [header: string]: string } } {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
