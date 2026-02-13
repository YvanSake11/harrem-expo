// src/types/api.types.ts

export interface User {
  id: number;
  email?: string;
  firstName: string;
  lastName: string;
  pseudo?: string;
  photoProfil?: string | null;
  country?: { id: number; name: string; code: string };
  city?: { id: number; name: string };
  first_name?: string;
  last_name?: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface City {
  id: number;
  name: string;
  countryId?: number;
}

export interface AvailableUserData {
  user: User;
  remainingSeconds: number;
  expiresAt: string;
  startedAt: string;
}

export interface AvailableUsersResponse {
  data: AvailableUserData[];
  page: number;
  pages: number;
  total?: number;
}

export interface AvailabilityStatus {
  available: boolean;
  expiresAt: string | null;
}

export interface AvailabilityHistoryItem {
  startedAt: string;
  expiresAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}