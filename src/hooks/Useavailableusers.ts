// src/hooks/useAvailableUsers.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateRemainingSeconds } from '../app/utils';
import {
  fetchMe,
  getCountries,
  getCities,
  getAvailableUsers,
  getUserAvailabilityStatus,
  activateUserAvailability,
  disableUserAvailability,
  getAvailabilityHistory,
} from '../app/api/apiClient';
import type {
  User,
  Country,
  City,
  AvailableUserData,
  AvailabilityHistoryItem,
} from '../types/api.types';

const STATUS_CHECK_INTERVAL = 60_000;
const COUNTDOWN_INTERVAL    = 1_000;

export function useAvailableUsers() {
  const [currentUser,     setCurrentUser]     = useState<User | null>(null);
  const [isAvailable,     setIsAvailable]     = useState(false);
  const [expiresAt,       setExpiresAt]       = useState<string | null>(null);
  const [remainingSeconds,setRemainingSeconds]= useState(0);
  const [availableUsers,  setAvailableUsers]  = useState<AvailableUserData[]>([]);
  const [history,         setHistory]         = useState<AvailabilityHistoryItem[]>([]);
  const [countries,       setCountries]       = useState<Country[]>([]);
  const [cities,          setCities]          = useState<City[]>([]);
  const [selectedCity,    setSelectedCity]    = useState<City | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [page,            setPage]            = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [totalItems,      setTotalItems]      = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [loadingUsers,    setLoadingUsers]    = useState(false);
  const [loadingStatus,   setLoadingStatus]   = useState(true);
  const [loadingHistory,  setLoadingHistory]  = useState(false);
  const [toggling,        setToggling]        = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [successMessage,  setSuccessMessage]  = useState<string | null>(null);

  const expiresAtRef = useRef(expiresAt);
  expiresAtRef.current = expiresAt;

  // ── HISTORY ──────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const data = await getAvailabilityHistory();
      setHistory(data);
    } catch (err) {
      console.error('[HISTORY] Erreur:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // ── STATUS ────────────────────────────────────────────────────────────────
  const loadAvailabilityStatus = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoadingStatus(true);
      const status = await getUserAvailabilityStatus();
      setIsAvailable(status.available);
      setExpiresAt(status.expiresAt);
      if (status.available && status.expiresAt) {
        const remaining = calculateRemainingSeconds(status.expiresAt);
        if (remaining <= 0) {
          setIsAvailable(false); setExpiresAt(null); setRemainingSeconds(0);
        } else {
          setRemainingSeconds(remaining);
        }
      } else {
        setRemainingSeconds(0);
      }
    } catch (err) {
      console.error('[STATUS] Erreur:', err);
      setIsAvailable(false); setExpiresAt(null); setRemainingSeconds(0);
    } finally {
      if (showLoader) setLoadingStatus(false);
    }
  }, []);

  // ── USERS ─────────────────────────────────────────────────────────────────
  const loadAvailableUsers = useCallback(async (pageNum = 1) => {
    if (!selectedCity || !selectedCountry || !currentUser) return;
    try {
      setLoadingUsers(true); setError(null);
      const response = await getAvailableUsers(selectedCity.id, selectedCountry.id, pageNum, 20);
      const filtered = (response.data || []).filter((u) => u.user.id !== currentUser.id);
      setAvailableUsers(filtered);
      setTotalPages(response.pages || 1);
      setTotalItems(filtered.length);
      setPage(response.page || pageNum);
    } catch (err) {
      console.error('[USERS] Erreur:', err);
      setError('loadUsersError'); setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [selectedCity, selectedCountry, currentUser]);

  // ── INIT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await fetchMe();
        setCurrentUser(user);
        await Promise.all([loadAvailabilityStatus(), loadHistory()]);
        const countriesData = await getCountries();
        setCountries(countriesData);
        if (!user.country?.id || !user.city?.id) { setError('incompleteProfile'); return; }
        const found = countriesData.find((c) => c.id === user.country?.id);
        if (!found) { setError('incompleteProfile'); return; }
        setSelectedCountry(found);
      } catch (err) {
        console.error('[INIT] Erreur:', err); setError('initError');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadAvailabilityStatus, loadHistory]);

  // ── CITIES ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCountry || !currentUser) return;
    const load = async () => {
      try {
        const data = await getCities(selectedCountry.id, selectedCountry.code);
        setCities(data);
        const found = data.find((c) => c.id === currentUser.city?.id);
        if (found) setSelectedCity(found);
        else setError('incompleteProfile');
      } catch { setError('loadCitiesError'); }
    };
    load();
  }, [selectedCountry, currentUser]);

  // ── LOAD USERS on city change ─────────────────────────────────────────────
  useEffect(() => {
    if (selectedCity && selectedCountry && currentUser &&
        !['incompleteProfile', 'initError'].includes(error ?? '')) {
      loadAvailableUsers(1);
    }
  }, [selectedCity, selectedCountry, currentUser, loadAvailableUsers, error]);

  // ── PERIODIC STATUS CHECK ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isAvailable) return;
    const interval = setInterval(() => loadAvailabilityStatus(false), STATUS_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [isAvailable, loadAvailabilityStatus]);

  // ── COUNTDOWN ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAvailable || !expiresAt) { setRemainingSeconds(0); return; }
    const remaining = calculateRemainingSeconds(expiresAt);
    if (remaining <= 0) { setIsAvailable(false); setExpiresAt(null); setRemainingSeconds(0); return; }
    setRemainingSeconds(remaining);
    const interval = setInterval(() => {
      const newR = calculateRemainingSeconds(expiresAtRef.current);
      setRemainingSeconds(newR);
      if (newR <= 0) {
        setIsAvailable(false); setExpiresAt(null); setRemainingSeconds(0);
        clearInterval(interval); loadAvailabilityStatus(false);
      }
    }, COUNTDOWN_INTERVAL);
    return () => clearInterval(interval);
  }, [isAvailable, expiresAt, loadAvailabilityStatus]);

  // ── TOGGLE ────────────────────────────────────────────────────────────────
  const handleToggleAvailability = async () => {
    try {
      setToggling(true); setError(null);
      if (isAvailable) {
        await disableUserAvailability();
        setIsAvailable(false); setExpiresAt(null); setRemainingSeconds(0);
        setSuccessMessage("Vous n'êtes plus disponible");
      } else {
        const result = await activateUserAvailability();
        setIsAvailable(true);
        if (result?.expiresAt) {
          setExpiresAt(result.expiresAt);
          setRemainingSeconds(calculateRemainingSeconds(result.expiresAt));
        }
        setSuccessMessage('Vous êtes maintenant disponible !');
      }
      setTimeout(() => setSuccessMessage(null), 3000);
      await new Promise((r) => setTimeout(r, 1000));
      await loadHistory();
      await loadAvailabilityStatus(false);
      if (selectedCity && selectedCountry) await loadAvailableUsers(1);
    } catch (err) {
      console.error('[TOGGLE] Erreur:', err);
      setError('availabilityError');
      await loadAvailabilityStatus(false);
    } finally {
      setToggling(false);
    }
  };

  return {
    currentUser, isAvailable, expiresAt, remainingSeconds,
    availableUsers, history, countries, cities,
    selectedCity, setSelectedCity,
    selectedCountry, setSelectedCountry,
    page, totalPages, totalItems,
    loading, loadingUsers, loadingStatus, loadingHistory, toggling,
    error, setError, successMessage,
    handleToggleAvailability, loadAvailableUsers, loadHistory, loadAvailabilityStatus,
  };
}