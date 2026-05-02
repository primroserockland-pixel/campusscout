import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ALL_CRITERIA, MAJORS, BUSINESS_MAJOR_IDS, getMajorWeights, getProgramRankLabel } from './utils/criteria';
import { computeScore, haversine, scoreColor, valColor, acceptClass, fmtK, sliderGradient } from './utils/scoring';
import { useSchools, geocodeZip, fetchSummary } from './hooks/useSchools';

// ── Logo SVG ──────────────────────────────────────────────────────────────
function Logo() {
  return (
    <a href="/" className="logo">
      <svg width="34" height="34" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <polygon points="40,12 72,28 40,44 8,28" fill="rgba(255,255,255,0.95)"/>
        <polygon points="40,12 72,28 40,44 8,28" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinejoin="round"/>
        <line x1="72" y1="28" x2="72" y2="44" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="72" cy="46" r="3" fill="#c9a84c"/>
        <line x1="70" y1="49" x2="67" y2="57" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="72" y1="49" x2="72" y2="58" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="74" y1="49" x2="77" y2="57" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="44" x2="40" y2="60" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="26" y="58" width="28" height="5" rx="2.5" fill="rgba(255,255,255,0.8)"/>
      </svg>
      <div className="logo-text">
        <h1>Campus<span>Scout</span></h1>
        <div className="logo-tagline">FIND YOUR PERFECT FIT</div>
      </div>
    </a>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────
function FilterBar({ filters, onFilterChange, onClear }) {
  const { zip, miles, gpa, sat, act, tuition } = filters;

  const toggle = (type) => onFilterChange(type, { ...filters[type], active: !filters[type]?.active });

  return (
    <div className="filter-bar">
      <div className="filter-bar-inner">
        {/* Location */}
        <div className={`fb-card${zip?.value?.length === 5 ? ' has-zip' : ''}`} id="fb-card-location">
          <span className="fb-card-label">📍 Location</span>
          <input className="fb-input zip" type="text" placeholder="Zip code"
            maxLength={5} inputMode="numeric" value={zip?.value || ''}
            onChange={e => onFilterChange('zip', { value: e.target.value })} />
          <select className="fb-select" value={miles || '9999'}
            onChange={e => onFilterChange('miles', e.target.value)}>
            <option value="9999">Any dist.</option>
            <option value="50">≤ 50 mi</option>
            <option value="100">≤ 100 mi</option>
            <option value="200">≤ 200 mi</option>
            <option value="300">≤ 300 mi</option>
            <option value="500">≤ 500 mi</option>
          </select>
        </div>
        {/* GPA */}
        <div className={`fb-card${gpa?.active ? ' active' : ''}`} id="fb-card-gpa">
          <span className="fb-card-label">📝 GPA (avg admitted)</span>
          <button className={`fb-toggle${gpa?.active ? ' on' : ''}`} onClick={() => toggle('gpa')} />
          <input className="fb-input" type="number" min="2.0" max="4.0" step="0.05"
            value={gpa?.min || '3.3'} disabled={!gpa?.active}
            onChange={e => onFilterChange('gpa', { ...gpa, min: e.target.value })} />
          <span className="fb-sep">–</span>
          <input className="fb-input" type="number" min="2.0" max="4.0" step="0.05"
            value={gpa?.max || '4.0'} disabled={!gpa?.active}
            onChange={e => onFilterChange('gpa', { ...gpa, max: e.target.value })} />
        </div>
        {/* SAT */}
        <div className={`fb-card${sat?.active ? ' active' : ''}`} id="fb-card-sat">
          <span className="fb-card-label">📐 SAT</span>
          <button className={`fb-toggle${sat?.active ? ' on' : ''}`} onClick={() => toggle('sat')} />
          <input className="fb-input" type="number" min="400" max="1600" step="10"
            value={sat?.min || '1200'} disabled={!sat?.active}
            onChange={e => onFilterChange('sat', { ...sat, min: e.target.value })} />
          <span className="fb-sep">–</span>
          <input className="fb-input" type="number" min="400" max="1600" step="10"
            value={sat?.max || '1500'} disabled={!sat?.active}
            onChange={e => onFilterChange('sat', { ...sat, max: e.target.value })} />
        </div>
        {/* ACT */}
        <div className={`fb-card${act?.active ? ' active' : ''}`} id="fb-card-act">
          <span className="fb-card-label">📏 ACT</span>
          <button className={`fb-toggle${act?.active ? ' on' : ''}`} onClick={() => toggle('act')} />
          <input className="fb-input" type="number" min="1" max="36" step="1"
            value={act?.min || '26'} disabled={!act?.active}
            onChange={e => onFilterChange('act', { ...act, min: e.target.value })} />
          <span className="fb-sep">–</span>
          <input className="fb-input" type="number" min="1" max="36" step="1"
            value={act?.max || '33'} disabled={!act?.active}
            onChange={e => onFilterChange('act', { ...act, max: e.target.value })} />
        </div>
        {/* COA */}
        <div className={`fb-card${tuition?.active ? ' active' : ''}`} id="fb-card-tuition">
          <span className="fb-card-label">💵 Max Cost (COA)</span>
          <button className={`fb-toggle${tuition?.active ? ' on' : ''}`} onClick={() => toggle('tuition')} />
          <div className="fb-slider-wrap">
            <input type="range" className="fb-slider" min={15000} max={100000} step={1000}
              value={tuition?.max || 100000} disabled={!tuition?.active}
              onChange={e => onFilterChange('tuition', { ...tuition, max: parseInt(e.target.value) })} />
          </div>
          <span className="fb-val">
            {tuition?.max >= 100000 ? 'Any' : `$${Math.round((tuition?.max || 100000) / 1000)}K`}
          </span>
        </div>
        <button className="fb-clear" onClick={onClear}>✕ Clear</button>
      </div>
    </div>
  );
}

// ── Sidebar: weights ──────────────────────────────────────────────────────
function Sidebar({ weights, enabled, majorId, onWeightChange, onToggle, onReset, onClear }) {
  const [collapsed, setCollapsed] = useState({});
  const totalWeight = Object.entries(weights).reduce((s, [id, w]) => enabled[id] ? s + w : s, 0);
  const activeCriteria = ALL_CRITERIA.filter(c => enabled[c.id] && weights[c.id] > 0);

  function toggleGroup(g) {
    setCollapsed(prev => ({ ...prev, [g]: !prev[g] }));
  }

  const programLabel = getProgramRankLabel(majorId);
  const isBusiness = BUSINESS_MAJOR_IDS.includes(majorId);

  // Group criteria
  const groups = [];
  let lastGroup = null;
  ALL_CRITERIA.forEach(c => {
    if (c.id === 'pq_rank' && !isBusiness) return; // hide P&Q for non-biz
    if (c.group && c.group !== lastGroup) {
      lastGroup = c.group;
      groups.push({ type: 'group', label: c.group, id: c.group.replace(/\W+/g, '_') });
    }
    groups.push({ type: 'crit', crit: c });
  });

  return (
    <aside className="sidebar">
      <div className="weight-bar">
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Total weight used</span>
        <span className={`weight-val ${totalWeight > 100 ? 'over' : 'ok'}`}>{totalWeight}%</span>
      </div>

      {groups.map((item, i) => {
        if (item.type === 'group') {
          const isCollapsed = collapsed[item.id] !== false; // default collapsed
          return (
            <div key={item.id}
              className={`group-header ${isCollapsed ? 'collapsed' : ''}`}
              onClick={() => toggleGroup(item.id)}>
              <span className="group-arrow">▾</span>
              {item.label}
            </div>
          );
        }
        const c = item.crit;
        const dynLabel = c.id === 'finance_rank' ? programLabel.label : c.label;
        const dynDesc  = c.id === 'finance_rank' ? programLabel.desc  : c.desc;
        const groupId  = ALL_CRITERIA.slice(0, ALL_CRITERIA.indexOf(c)).reverse().find(x => x.group)?.group?.replace(/\W+/g, '_');
        const isGroupCollapsed = collapsed[groupId] !== false;

        return (
          <div key={c.id} className="group-children" style={{ maxHeight: isGroupCollapsed ? 0 : undefined, overflow: 'hidden' }}>
            <div className={`criterion ${!enabled[c.id] ? 'disabled' : ''}`}>
              <div className="crit-top">
                <button className={`crit-toggle ${enabled[c.id] ? 'on' : ''}`}
                  onClick={() => onToggle(c.id)} />
                <span className="crit-label">{c.icon} {dynLabel}</span>
                <span className="crit-weight">{weights[c.id] || 0}%</span>
              </div>
              <input type="range" className={`crit-slider ${weights[c.id] === 0 ? 'zero' : ''}`}
                min={0} max={30} value={weights[c.id] || 0}
                disabled={!enabled[c.id]}
                style={{ background: sliderGradient(weights[c.id] || 0) }}
                onChange={e => onWeightChange(c.id, parseInt(e.target.value))} />
              <div className="crit-desc">{dynDesc}</div>
            </div>
          </div>
        );
      })}

      <div className="btn-row">
        <button className="reset-btn" onClick={onReset}>↺ Reset</button>
        <button className="reset-btn" onClick={onClear}>✕ Clear all</button>
      </div>

      <div className="glossary">
        <div className="glossary-title">📖 Glossary</div>
        {[
          ['Middle 50%', 'The SAT/ACT/GPA range for the middle half of admitted students. 25% scored below, 25% above.'],
          ['COA', 'Cost of Attendance — sticker price: tuition + fees + room + board, before any aid.'],
          ['Net Price', 'What your family actually pays after grants and scholarships.'],
          ['Admit Rate', '% of applicants offered admission. 🔴 Red ≤15%, 🟠 Orange 16-30%, 🟡 Amber 31-55%, 🟢 Green >55%.'],
        ].map(([term, def]) => (
          <div key={term} className="glossary-item">
            <div className="glossary-term">{term}</div>
            <div className="glossary-def">{def}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ── School card ───────────────────────────────────────────────────────────
function SchoolCard({ school, rank, score, activeCriteria, comparing, distanceMap,
                      filters, majorId, onCompare, onInfo }) {
  const belowAvg = [];
  if (filters.gpa?.active && school.gpa_avg) {
    if (parseFloat(filters.gpa.min) > school.gpa_avg) belowAvg.push('GPA');
  }
  if (filters.sat?.active && school.sat_lo && school.sat_hi) {
    const mid = Math.round((school.sat_lo + school.sat_hi) / 2);
    if (parseFloat(filters.sat.min) < mid) belowAvg.push('SAT');
  }
  if (filters.act?.active && school.act_lo && school.act_hi) {
    const mid = Math.round((school.act_lo + school.act_hi) / 2);
    if (parseFloat(filters.act.min) < mid) belowAvg.push('ACT');
  }

  const anyFilterOn = filters.gpa?.active || filters.sat?.active || filters.act?.active || filters.tuition?.active;
  const dist = distanceMap[school.id];

  const rankClass = rank === 0 ? 'top1' : rank === 1 ? 'top2' : rank === 2 ? 'top3' : '';

  return (
    <div className={`school-card ${comparing ? 'comparing' : ''}`}>
      <div className="card-top">
        <div className={`rank-badge ${rankClass}`}>#{rank + 1}</div>
        <div className="school-info">
          <div className="school-name">
            {school.name}
            {school.accept_rate != null && (
              <span className={`accept-badge ${acceptClass(school.accept_rate)}`} style={{ marginLeft: 6 }}>
                {school.accept_rate}% admit
              </span>
            )}
            {belowAvg.length > 0 && <span style={{ marginLeft: 5, fontSize: 13 }}>⚠️</span>}
          </div>
          <div className="school-meta">
            {school.location}
            <span className={`pill ${school.type === 'Public' ? 'pill-green' : 'pill-blue'}`}>{school.type}</span>
            {dist != null && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>📍 {Math.round(dist)} mi</span>}
            {belowAvg.length > 0 && <span style={{ color: '#f59e0b' }}>below avg {belowAvg.join(', ')}</span>}
          </div>
        </div>
        <div className="school-score">
          <div className="score-num" style={{ color: scoreColor(score) }}>{score.toFixed(1)}</div>
          <div className="score-max">/10</div>
        </div>
        <div className="card-actions">
          <button className={`card-btn ${comparing ? 'active' : ''}`}
            onClick={e => { e.stopPropagation(); onCompare(school.id); }}>
            {comparing ? '✓ Comparing' : '+ Compare'}
          </button>
          <button className="card-btn info"
            onClick={e => { e.stopPropagation(); onInfo(school); }}
            title="AI pros & cons for this major">ℹ</button>
        </div>
      </div>

      {/* Mini bars */}
      {activeCriteria.length > 0 && (
        <div className="mini-bars">
          {activeCriteria.slice(0, 8).map(c => {
            const v = school.data?.[c.id] ?? 5;
            return (
              <div key={c.id}>
                <div className="mini-bar-label">
                  <span>{c.icon} {c.id === 'finance_rank' ? getProgramRankLabel(majorId).label.split(' ')[0] : c.label}</span>
                  <span style={{ color: valColor(v) }}>{v}/10</span>
                </div>
                <div className="mini-bar-track">
                  <div className="mini-bar-fill" style={{ width: `${v * 10}%`, background: valColor(v) }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admit row */}
      {anyFilterOn && (
        <div className="admit-row">
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Middle 50%:</span>
          {filters.gpa?.active && school.gpa_avg && (
            <span>📝 GPA <strong style={{ color: belowAvg.includes('GPA') ? '#f59e0b' : undefined }}>{school.gpa_avg.toFixed(2)} avg</strong>
              {belowAvg.includes('GPA') && <span className="below-avg"> ⚠ below avg</span>}
            </span>
          )}
          {filters.sat?.active && school.sat_lo && (
            <span>📐 SAT <strong style={{ color: belowAvg.includes('SAT') ? '#f59e0b' : undefined }}>{school.sat_lo}–{school.sat_hi}</strong>
              {belowAvg.includes('SAT') && <span className="below-avg"> ⚠ below avg</span>}
            </span>
          )}
          {filters.act?.active && school.act_lo && (
            <span>📏 ACT <strong style={{ color: belowAvg.includes('ACT') ? '#f59e0b' : undefined }}>{school.act_lo}–{school.act_hi}</strong>
              {belowAvg.includes('ACT') && <span className="below-avg"> ⚠ below avg</span>}
            </span>
          )}
          {filters.tuition?.active && school.coa_sticker && (
            <span>💵 Sticker <strong>{fmtK(school.coa_sticker)}</strong> · net ~{fmtK(school.coa_net)}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Info Panel ────────────────────────────────────────────────────────────
function InfoPanel({ school, majorId, open, onClose, distanceMap, filters }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const major = MAJORS[majorId];
  const isBusiness = BUSINESS_MAJOR_IDS.includes(majorId);
  const majorType = isBusiness ? 'business' : 'general';

  useEffect(() => {
    if (!open || !school) return;
    setSummary(null); setError(null); setLoading(true);
    fetchSummary(school, major?.label || 'General', majorType)
      .then(data => setSummary(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, school?.id, majorId]);

  const dist = school && distanceMap[school.id];

  return (
    <>
      <div className={`info-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`info-panel ${open ? 'open' : ''}`}>
        <div className="info-panel-header">
          <button className="info-close-btn" onClick={onClose}>✕</button>
          <div className="info-panel-title">{school?.name || ''}</div>
          <div className="info-panel-sub">
            {major?.label} · {school?.accept_rate != null ? `${school.accept_rate}% admit` : ''} · ~{fmtK(school?.coa_net)}/yr
            {dist != null && ` · 📍 ${Math.round(dist)} mi`}
          </div>
        </div>
        <div className="info-body">
          {loading && (
            <div className="info-loading">
              {[90, 75, 85, 60, 90, 70, 80].map((w, i) => (
                <div key={i} className="skel" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}
          {error && (
            <div style={{ padding: 20, color: 'var(--muted)', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}
          {summary && (
            <>
              <div className="info-section pros">
                <div className="info-section-title">✅ Pros</div>
                <ul className="info-list">
                  {summary.pros?.map((p, i) => <li key={i}><span>✓</span><span>{p}</span></li>)}
                </ul>
              </div>
              <div className="info-section cons">
                <div className="info-section-title">⚠️ Cons</div>
                <ul className="info-list">
                  {summary.cons?.map((c, i) => <li key={i}><span>✗</span><span>{c}</span></li>)}
                </ul>
              </div>
              <div className="info-section bottom">
                <div className="info-section-title">💡 Bottom Line</div>
                <div className="bottom-line">{summary.bottom_line}</div>
              </div>
              {/* Score match */}
              {(filters.gpa?.active || filters.sat?.active || filters.act?.active) && school && (
                <div className="info-match">
                  {filters.gpa?.active && school.gpa_avg && (
                    <span className={`match-item ${parseFloat(filters.gpa.min) <= school.gpa_avg ? 'match-ok' : 'match-warn'}`}>
                      GPA {parseFloat(filters.gpa.min) <= school.gpa_avg ? '✅' : '⚠️'} {school.gpa_avg.toFixed(2)} avg
                    </span>
                  )}
                  {filters.sat?.active && school.sat_lo && (
                    <span className={`match-item ${parseFloat(filters.sat.min) >= school.sat_lo ? 'match-ok' : 'match-warn'}`}>
                      SAT {parseFloat(filters.sat.min) >= school.sat_lo ? '✅' : '⚠️'} {school.sat_lo}–{school.sat_hi}
                    </span>
                  )}
                  {filters.act?.active && school.act_lo && (
                    <span className={`match-item ${parseFloat(filters.act.min) >= school.act_lo ? 'match-ok' : 'match-warn'}`}>
                      ACT {parseFloat(filters.act.min) >= school.act_lo ? '✅' : '⚠️'} {school.act_lo}–{school.act_hi}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────
export default function App() {
  // Theme
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cs-theme');
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cs-theme', theme);
  }, [theme]);

  // Major
  const [majorId, setMajorId] = useState('business_finance');

  // Weights & enabled
  const initWeights = () => {
    const w = {}; const e = {};
    ALL_CRITERIA.forEach(c => { w[c.id] = c.defaultWeight; e[c.id] = c.defaultOn; });
    return { weights: w, enabled: e };
  };
  const [{ weights, enabled }, setWE] = useState(initWeights);

  const handleMajorChange = (id) => {
    setMajorId(id);
    const preset = getMajorWeights(id);
    setWE(prev => {
      const w = { ...prev.weights };
      const e = { ...prev.enabled };
      ALL_CRITERIA.forEach(c => {
        if (preset[c.id] !== undefined) {
          w[c.id] = preset[c.id];
          e[c.id] = preset[c.id] > 0;
        }
      });
      return { weights: w, enabled: e };
    });
    setComparing(new Set());
  };

  const handleWeightChange = (id, val) => {
    setWE(prev => ({ weights: { ...prev.weights, [id]: val }, enabled: prev.enabled }));
  };
  const handleToggle = (id) => {
    setWE(prev => ({ weights: prev.weights, enabled: { ...prev.enabled, [id]: !prev.enabled[id] } }));
  };
  const handleReset = () => setWE(prev => {
    const w = {}; const e = {};
    const preset = getMajorWeights(majorId);
    ALL_CRITERIA.forEach(c => {
      w[c.id] = preset[c.id] ?? c.defaultWeight;
      e[c.id] = (preset[c.id] ?? c.defaultWeight) > 0;
    });
    return { weights: w, enabled: e };
  });
  const handleClearWeights = () => {
    setWE(prev => {
      const w = {}; const e = {};
      ALL_CRITERIA.forEach(c => { w[c.id] = 0; e[c.id] = false; });
      return { weights: w, enabled: e };
    });
  };

  // Filters
  const [filters, setFilters] = useState({
    zip: { value: '' }, miles: '9999',
    gpa: { active: false, min: '3.3', max: '4.0' },
    sat: { active: false, min: '1200', max: '1500' },
    act: { active: false, min: '26', max: '33' },
    tuition: { active: false, max: 100000 },
  });
  const [userCoords, setUserCoords] = useState(null);
  const zipTimerRef = useRef(null);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'zip') {
      clearTimeout(zipTimerRef.current);
      if (value.value?.length === 5) {
        zipTimerRef.current = setTimeout(async () => {
          try {
            const coords = await geocodeZip(value.value);
            setUserCoords(coords);
          } catch {}
        }, 600);
      } else {
        setUserCoords(null);
        setDistanceMap({});
      }
    }
  }, []);

  const handleClearFilters = () => {
    setFilters({
      zip: { value: '' }, miles: '9999',
      gpa: { active: false, min: '3.3', max: '4.0' },
      sat: { active: false, min: '1200', max: '1500' },
      act: { active: false, min: '26', max: '33' },
      tuition: { active: false, max: 100000 },
    });
    setUserCoords(null);
    setDistanceMap({});
  };

  // Pagination & search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const perPage = 50;

  // Send weights + filters to backend — backend does ALL scoring, filtering, sorting
  const activeWeights = useMemo(() => {
    const aw = {};
    ALL_CRITERIA.forEach(cr => {
      if (enabled[cr.id] && weights[cr.id] > 0) aw[cr.id] = weights[cr.id];
    });
    return aw;
  }, [weights, enabled]);

  // Reset to page 1 when weights or filters change
  useEffect(() => { setPage(1); }, [
    JSON.stringify(activeWeights), JSON.stringify(filters),
    userCoords?.lat, userCoords?.lng,
  ]);

  const { data, loading, error } = useSchools({
    page, perPage, search, state: stateFilter,
    weights: activeWeights,
    filters,
    userCoords,
  });

  // Schools come pre-scored and sorted from backend
  const ranked = data?.schools || [];

  // Active criteria — for display only (mini bars, weight chips)
  const activeCriteria = useMemo(() =>
    ALL_CRITERIA.filter(c => enabled[c.id] && weights[c.id] > 0 &&
      !(c.id === 'pq_rank' && !BUSINESS_MAJOR_IDS.includes(majorId))),
    [enabled, weights, majorId]
  );

  // Distance map from backend-attached distance field
  const distanceMap = useMemo(() => {
    const dm = {};
    ranked.forEach(s => { if (s.distance != null) dm[s.id] = s.distance; });
    return dm;
  }, [ranked]);

  // Weight summary total
  const totalW = activeCriteria.reduce((s, c) => s + weights[c.id], 0);

  // Compare
  const [comparing, setComparing] = useState(new Set());
  const toggleCompare = (id) => {
    setComparing(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  // Info panel
  const [infoSchool, setInfoSchool] = useState(null);

  // Any filter active
  const anyFilterOn = filters.gpa?.active || filters.sat?.active || filters.act?.active ||
    (filters.tuition?.active && filters.tuition.max < 100000) ||
    (userCoords && parseInt(filters.miles) < 9999);

  // Compare table
  const compareSchools = ranked.filter(s => comparing.has(s.id));

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <Logo />
          <div className="header-right">
            <select className="major-select" value={majorId}
              onChange={e => handleMajorChange(e.target.value)}>
              <optgroup label="── Business ──">
                <option value="business_finance">💼 Business — Finance</option>
                <option value="business_accounting">📒 Business — Accounting</option>
                <option value="business_marketing">📣 Business — Marketing</option>
                <option value="business_mgmt">🏢 Business — Management</option>
                <option value="business_entrepreneurship">🚀 Business — Entrepreneurship</option>
              </optgroup>
              <optgroup label="── Technology ──">
                <option value="computer_science">💻 Computer Science</option>
                <option value="data_science">📊 Data Science</option>
                <option value="cybersecurity">🔐 Cybersecurity</option>
                <option value="ai_ml">🤖 AI / Machine Learning</option>
              </optgroup>
              <optgroup label="── STEM ──">
                <option value="engineering">⚙️ Engineering</option>
                <option value="biology">🧬 Biology / Life Sciences</option>
                <option value="chemistry">🧪 Chemistry / Biochemistry</option>
                <option value="math_stats">📐 Math / Statistics</option>
              </optgroup>
              <optgroup label="── Liberal Arts ──">
                <option value="psychology">🧠 Psychology</option>
                <option value="communications">📡 Communications / Media</option>
                <option value="political_science">🏛 Political Science / Pre-Law</option>
                <option value="economics">📈 Economics</option>
                <option value="english">📖 English / Creative Writing</option>
                <option value="history">🏺 History</option>
              </optgroup>
              <optgroup label="── Health ──">
                <option value="nursing">🏥 Nursing / Health Sciences</option>
                <option value="premed">⚕️ Pre-Med / Biology</option>
                <option value="public_health">🌐 Public Health</option>
              </optgroup>
              <optgroup label="── Design & Arts ──">
                <option value="architecture">🏗 Architecture</option>
                <option value="graphic_design">🎨 Graphic Design / Visual Arts</option>
              </optgroup>
            </select>
            {/* Search */}
            <input
              type="text"
              placeholder="Search school name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                padding:'7px 12px', borderRadius:7, border:'1px solid rgba(255,255,255,0.25)',
                background:'rgba(255,255,255,0.1)', color:'#fff', fontSize:12,
                fontFamily:'Plus Jakarta Sans', width:180,
              }}
            />
            <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀ Light mode' : '☽ Dark mode'}
            </button>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />

      {/* Body */}
      <div className="app-body">
        <Sidebar
          weights={weights} enabled={enabled} majorId={majorId}
          onWeightChange={handleWeightChange} onToggle={handleToggle}
          onReset={handleReset} onClear={handleClearWeights}
        />

        <main className="main">
          {/* Compare panel */}
          {compareSchools.length >= 2 && (
            <div className="compare-panel">
              <h3>⚖️ Side-by-Side Comparison
                <button className="clear-compare" onClick={() => setComparing(new Set())}>Clear</button>
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th>Criterion</th>
                      {compareSchools.map(s => <th key={s.id}>{s.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Score</td>
                      {compareSchools.map(s => {
                        const best = compareSchools.every(x => s.score >= x.score);
                        return <td key={s.id} className={best ? 'td-best' : ''}>{s.score.toFixed(1)}/10</td>;
                      })}
                    </tr>
                    <tr><td>Location</td>{compareSchools.map(s => <td key={s.id}>{s.location}</td>)}</tr>
                    <tr><td>Accept Rate</td>{compareSchools.map(s => <td key={s.id}>{s.accept_rate != null ? `${s.accept_rate}%` : 'N/A'}</td>)}</tr>
                    <tr><td>Net Price/yr</td>{compareSchools.map(s => <td key={s.id}>{fmtK(s.coa_net)}</td>)}</tr>
                    <tr><td>SAT Mid-50%</td>{compareSchools.map(s => <td key={s.id}>{s.sat_lo && s.sat_hi ? `${s.sat_lo}–${s.sat_hi}` : 'N/A'}</td>)}</tr>
                    <tr><td>10yr Earnings</td>{compareSchools.map(s => <td key={s.id}>{fmtK(s.earnings_10yr)}</td>)}</tr>
                    {activeCriteria.slice(0, 6).map(c => (
                      <tr key={c.id}>
                        <td>{c.icon} {c.id === 'finance_rank' ? getProgramRankLabel(majorId).label.split(' ')[0] : c.label}</td>
                        {compareSchools.map(s => {
                          const v = s.data?.[c.id] ?? 5;
                          const best = compareSchools.every(x => v >= (x.data?.[c.id] ?? 5));
                          return <td key={s.id} className={best ? 'td-best' : ''}>{v}/10</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Weight summary */}
          {activeCriteria.length > 0 && (
            <div className="weight-summary">
              <div className="weight-summary-title">⚖️ Active Criteria Weights</div>
              <div className="weight-chips">
                {activeCriteria.map(c => {
                  const pct = Math.round((weights[c.id] / totalW) * 100);
                  const col = pct >= 20 ? '#15803d' : pct >= 12 ? '#2563eb' : '#d97706';
                  return (
                    <div key={c.id} className="weight-chip">
                      <span>{c.icon} {c.id === 'finance_rank' ? getProgramRankLabel(majorId).label.split(' ')[0] : c.label}</span>
                      <div className="chip-bar" style={{ width: Math.max(pct, 4), background: col }} />
                      <span className="chip-pct" style={{ color: col }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter status */}
          {anyFilterOn && (
            <div className="filter-status">
              <span className="filter-status-active">🔍 Filters active</span>
              <span>Showing <strong>{ranked.length}</strong> of {data?.total || '?'} schools</span>
              {filters.gpa?.active && <span className="filter-tag">GPA {filters.gpa.min}–{filters.gpa.max}</span>}
              {filters.sat?.active && <span className="filter-tag">SAT {filters.sat.min}–{filters.sat.max}</span>}
              {filters.act?.active && <span className="filter-tag">ACT {filters.act.min}–{filters.act.max}</span>}
              {filters.tuition?.active && filters.tuition.max < 100000 && <span className="filter-tag">Max ${Math.round(filters.tuition.max / 1000)}K</span>}
              {userCoords && parseInt(filters.miles) < 9999 && <span className="filter-tag">📍 ≤{filters.miles} mi</span>}
            </div>
          )}

          {/* Empty / loading / results */}
          {activeCriteria.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚖️</div>
              <h3>No criteria selected</h3>
              <p>Open a group in the sidebar and toggle on at least one criterion — schools will rank as soon as you do.</p>
            </div>
          ) : loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading schools...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <h3>Could not load schools</h3>
              <p>{error}</p>
            </div>
          ) : ranked.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No schools match your filters</h3>
              <p>Try widening your filters or adjusting your score ranges.</p>
            </div>
          ) : (
            <>
              <div className="ranked-list">
                {ranked.map((school, i) => (
                  <SchoolCard key={school.id}
                    school={school} rank={i} score={school.score}
                    activeCriteria={activeCriteria}
                    comparing={comparing.has(school.id)}
                    distanceMap={distanceMap}
                    filters={filters}
                    majorId={majorId}
                    onCompare={toggleCompare}
                    onInfo={s => setInfoSchool(s)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} className={`page-btn ${p === page ? 'current' : ''}`}
                        onClick={() => setPage(p)}>{p}</button>
                    );
                  })}
                  <button className="page-btn" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                  <span className="page-info">Page {page} of {data.totalPages} · {data.total} schools</span>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Info Panel */}
      <InfoPanel
        school={infoSchool}
        majorId={majorId}
        open={infoSchool != null}
        onClose={() => setInfoSchool(null)}
        distanceMap={distanceMap}
        filters={filters}
      />
    </>
  );
}
