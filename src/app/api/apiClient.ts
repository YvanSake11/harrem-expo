// src/api/apiClient.ts
// Toutes les fonctions d'appel API — utilise authFetch depuis utils/index.ts

import { authFetch, setJwt, setUser, apiUrl } from '../utils';
import type {
  User,
  Country,
  City,
  AvailableUsersResponse,
  AvailabilityStatus,
  AvailabilityHistoryItem,
} from '../../types/api.types';

// ─────────────────────────────────────────────
//  AUTHENTIFICATION
// ─────────────────────────────────────────────
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  const response = await fetch(`${apiUrl()}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Identifiant ou mot de passe incorrect.');
  }

  if (data.token) await setJwt(data.token);
  if (data.user)  await setUser(data.user);

  return data;
}

export async function register(
  email: string,
  password: string,
  confirmPassword: string,
  country: number,
  city: number,
  accountType: 'standard' | 'professional' = 'standard'
): Promise<any> {
  const params = new URLSearchParams({
    email: email.trim(),
    password,
    confirmPassword,
    country: country.toString(),
    city: city.toString(),
    accountType,
  });

  const response = await fetch(`${apiUrl()}/api/register?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    const text = await response.text();
    throw new Error(text || 'Erreur serveur');
  }

  if (!response.ok) {
    if (response.status === 409) throw new Error(json?.message || 'Email déjà utilisé.');
    if (response.status === 401) throw new Error(json?.message || 'Compte Google existant.');
    if (response.status === 400) throw new Error(json?.message || 'Données invalides.');
    throw new Error(json?.message || `Erreur ${response.status}`);
  }

  return json;
}

// ─────────────────────────────────────────────
//  UTILISATEUR COURANT
// ─────────────────────────────────────────────
export async function fetchMe(): Promise<User> {
  return authFetch<User>('/api/user/api/user/me');
}

// ─────────────────────────────────────────────
//  PAYS & VILLES
// ─────────────────────────────────────────────
export async function getCountries(): Promise<Country[]> {
  try {
    console.log('🌍 [API] Récupération des pays...');
    const response = await authFetch<Country[]>('/api/location/countries');
    if (!response) {
      console.warn('⚠️ [API] Aucun pays reçu');
      return [];
    }
    console.log(`✅ [API] ${response.length} pays reçus`);
    return response;
  } catch (err: any) {
    console.error('❌ [API] Erreur getCountries:', err);
    throw new Error('Impossible de charger les pays');
  }
}

export async function getCities(
  countryId: number | string,
  countryCode: string
): Promise<City[]> {
  try {
    console.log(`🏙️ [API] Récupération des villes pour pays ${countryId} (${countryCode})...`);
    const response = await authFetch<City[]>(
      `/api/location/cities?countryId=${countryId}&country=${countryCode}`
    );
    if (!response) {
      console.warn('⚠️ [API] Aucune ville reçue');
      return [];
    }
    console.log(`✅ [API] ${response.length} villes reçues`);
    return response;
  } catch (err: any) {
    console.error('❌ [API] Erreur getCities:', err);
    throw new Error('Impossible de charger les villes');
  }
}

// ─────────────────────────────────────────────
//  DISPONIBILITÉ
// ─────────────────────────────────────────────
export async function getAvailableUsers(
  cityId: number,
  countryId: number,
  page = 1,
  limit = 20
): Promise<AvailableUsersResponse> {
  try {
    console.log(`👥 [API] Récupération utilisateurs disponibles - ville ${cityId}, page ${page}...`);
    const response = await authFetch<AvailableUsersResponse>(
      `/api/UserAvailability/users?cityId=${cityId}&countryId=${countryId}&page=${page}&limit=${limit}`
    );
    console.log(`✅ [API] ${response?.data?.length ?? 0} utilisateurs reçus`);
    return response;
  } catch (err: any) {
    console.error('❌ [API] Erreur getAvailableUsers:', err);
    throw new Error('Impossible de charger les utilisateurs disponibles');
  }
}

export async function getUserAvailabilityStatus(): Promise<AvailabilityStatus> {
  return authFetch<AvailabilityStatus>('/api/UserAvailability/status');
}

export async function activateUserAvailability(): Promise<{ expiresAt: string }> {
  return authFetch<{ expiresAt: string }>('/api/UserAvailability/activate', {
    method: 'POST',
  });
}

export async function disableUserAvailability(): Promise<void> {
  return authFetch<void>('/api/UserAvailability/disable', { method: 'POST' });
}

export async function getAvailabilityHistory(): Promise<AvailabilityHistoryItem[]> {
  return authFetch<AvailabilityHistoryItem[]>('/api/UserAvailability/history');
}


export type { User, Country, City, AvailableUsersResponse, AvailabilityStatus, AvailabilityHistoryItem } from '../../types/api.types';
