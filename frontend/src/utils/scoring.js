// ── Score color ───────────────────────────────────────────────────────────
export function scoreColor(s) {
  if (s >= 8.5) return '#15803d';
  if (s >= 7.5) return '#65a30d';
  if (s >= 6.5) return '#d97706';
  if (s >= 5.5) return '#ea580c';
  return '#dc2626';
}

export function valColor(v) {
  if (v >= 9) return '#15803d';
  if (v >= 8) return '#65a30d';
  if (v >= 7) return '#d97706';
  if (v >= 6) return '#ea580c';
  return '#dc2626';
}

// ── Acceptance rate badge ─────────────────────────────────────────────────
export function acceptClass(rate) {
  if (!rate) return '';
  if (rate <= 15) return 'accept-vhard';
  if (rate <= 30) return 'accept-hard';
  if (rate <= 55) return 'accept-medium';
  return 'accept-easy';
}

// ── Haversine distance (miles) ────────────────────────────────────────────
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Compute weighted score ────────────────────────────────────────────────
export function computeScore(school, weights, enabled, majorId, BUSINESS_MAJOR_IDS) {
  let total = 0;
  let totalW = 0;
  for (const [id, w] of Object.entries(weights)) {
    if (!enabled[id] || w <= 0) continue;
    if (id === 'pq_rank' && !BUSINESS_MAJOR_IDS.includes(majorId)) continue;
    const val = school.data?.[id] ?? 5;
    total += val * w;
    totalW += w;
  }
  return totalW === 0 ? 0 : total / totalW;
}

// ── Format currency ───────────────────────────────────────────────────────
export function fmtK(n) {
  if (!n) return 'N/A';
  return `$${Math.round(n / 1000)}K`;
}

// ── Format accept rate ────────────────────────────────────────────────────
export function fmtRate(r) {
  if (!r && r !== 0) return 'N/A';
  return `${r}%`;
}

// ── Slider fill gradient ──────────────────────────────────────────────────
export function sliderGradient(val, max = 30) {
  const pct = (val / max) * 100;
  if (val === 0) return 'var(--border)';
  const color = pct < 30 ? '#d97706' : pct < 65 ? '#2563eb' : '#15803d';
  return `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--border) ${pct}%, var(--border) 100%)`;
}
