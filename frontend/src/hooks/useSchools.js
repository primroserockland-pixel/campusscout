import { useState, useEffect, useCallback, useRef } from 'react';

const BASE = import.meta.env.VITE_API_URL || '';

export function useSchools({ page, perPage, search, state, weights, filters, userCoords }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);
  const debounceRef           = useRef(null);

  const doFetch = useCallback(async (params) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE}/api/schools?${params}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ page, perPage });
    if (search) params.set('search', search);
    if (state)  params.set('state', state);

    // Weights
    if (weights && Object.keys(weights).length > 0) {
      const activeWeights = Object.fromEntries(
        Object.entries(weights).filter(([, v]) => v > 0)
      );
      if (Object.keys(activeWeights).length > 0) {
        params.set('weights', JSON.stringify(activeWeights));
      }
    }

    // Filters
    if (filters?.gpa?.active) {
      params.set('gpaMin', filters.gpa.min || '2.0');
      params.set('gpaMax', filters.gpa.max || '4.0');
    }
    if (filters?.sat?.active) {
      params.set('satMin', filters.sat.min || '400');
      params.set('satMax', filters.sat.max || '1600');
    }
    if (filters?.act?.active) {
      params.set('actMin', filters.act.min || '1');
      params.set('actMax', filters.act.max || '36');
    }
    if (filters?.tuition?.active && filters.tuition.max < 100000) {
      params.set('coaMax', filters.tuition.max);
    }
    if (userCoords && filters?.miles && parseInt(filters.miles) < 9999) {
      params.set('userLat', userCoords.lat);
      params.set('userLng', userCoords.lng);
      params.set('maxMiles', filters.miles);
    }

    // Debounce — wait 400ms after last change before firing
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(params), 400);

    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [
    page, perPage, search, state,
    JSON.stringify(weights),
    JSON.stringify(filters),
    userCoords?.lat, userCoords?.lng,
    doFetch,
  ]);

  return { data, loading, error };
}

// Geocode zip via backend
const geoCache = {};
export async function geocodeZip(zip) {
  if (geoCache[zip]) return geoCache[zip];
  const res = await fetch(`${BASE}/api/geocode?zip=${zip}`);
  if (!res.ok) throw new Error('Could not geocode zip');
  const data = await res.json();
  geoCache[zip] = data;
  return data;
}

// Fetch AI summary from backend
const summaryCache = {};
export async function fetchSummary(school, majorLabel, majorType) {
  const key = `${school.id}_${majorType}`;
  if (summaryCache[key]) return summaryCache[key];
  const res = await fetch(`${BASE}/api/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ school, majorLabel, majorType }),
  });
  if (!res.ok) throw new Error(`Summary API ${res.status}`);
  const data = await res.json();
  summaryCache[key] = data;
  return data;
}
