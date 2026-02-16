// src/utils/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────
//  BASE URL
// ─────────────────────────────────────────────
export const apiUrl = (): string => {
  return 'https://harem.nash-dev.fr';
};

export const mercureUrl = (): string => {
  return 'https://harem.nash-dev.fr/.well-known/mercure';
};

export const profilePictureUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiUrl()}/uploads/profile/${path}`;
};

// ─────────────────────────────────────────────
//  JWT
// ─────────────────────────────────────────────

/**
 * Récupère le JWT.
 * Cherche à la fois 'token' et 'userToken' pour être tolérant.
 */
export const getJwt = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) return token;
    const userToken = await AsyncStorage.getItem('userToken');
    return userToken;
  } catch (err) {
    console.error('[JWT] Erreur récupération :', err);
    return null;
  }
};

export const setJwt = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (err) {
    console.error('[JWT] Erreur sauvegarde :', err);
  }
};

export const removeJwt = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userToken');
  } catch (err) {
    console.error('[JWT] Erreur suppression :', err);
  }
};

// ─────────────────────────────────────────────
//  USER (cache local)
// ─────────────────────────────────────────────
export const getUser = async (): Promise<any | null> => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error('[USER] Erreur récupération :', err);
    return null;
  }
};

export const setUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (err) {
    console.error('[USER] Erreur sauvegarde :', err);
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (err) {
    console.error('[USER] Erreur suppression :', err);
  }
};

// ─────────────────────────────────────────────
//  AUTH FETCH  (fetch authentifié)
// ─────────────────────────────────────────────
export async function authFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getJwt();

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Fusionner les headers custom
  if (options.headers && typeof options.headers === 'object') {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  // Ne pas forcer Content-Type si c'est un FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${apiUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erreur HTTP ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    return null as T;
  }
}

// ─────────────────────────────────────────────
//  MIME TYPE  (utile pour FormData / upload)
// ─────────────────────────────────────────────
export const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':  return 'image/jpeg';
    case 'png':   return 'image/png';
    case 'gif':   return 'image/gif';
    case 'webp':  return 'image/webp';
    case 'pdf':   return 'application/pdf';
    case 'doc':   return 'application/msword';
    case 'docx':  return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt':   return 'application/vnd.ms-powerpoint';
    case 'pptx':  return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'mp3':   return 'audio/mpeg';
    case 'm4a':   return 'audio/mp4';
    case 'wav':   return 'audio/wav';
    case 'ogg':   return 'audio/ogg';
    default:      return 'application/octet-stream';
  }
};

// ─────────────────────────────────────────────
//  HELPERS DIVERS
// ─────────────────────────────────────────────

/** Formate un temps restant en secondes → "2h 30min" ou "15 min" */
export const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return 'Expiré';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes} min`;
};

/** Calcule les secondes restantes avant une date d'expiration */
export const calculateRemainingSeconds = (expiresAt: string | null): number => {
  if (!expiresAt) return 0;
  const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
};

/** Formate une date en chaîne locale FR */
export const formatDate = (
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', options ?? {
    weekday: 'short', day: 'numeric', month: 'short',
  });
};

/** Formate une heure en HH:MM */
export const formatTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });
};

/** Déconnexion complète (efface token + user en cache) */
export const logout = async (): Promise<void> => {
  await removeJwt();
  await removeUser();
};

/** Vérifie si un token existe (pour le routing au démarrage) */
export const hasJwt = async (): Promise<boolean> => {
  const token = await getJwt();
  return token !== null && token.length > 0;
};