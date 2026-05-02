const express = require('express');
const { enrich } = require('../enrichment');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const router = express.Router();

const schoolCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });
const SCORECARD_BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools';

const SCORECARD_FIELDS = [
  'id','school.name','school.city','school.state','school.ownership',
  'school.latitude','school.longitude','school.school_url',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.act_scores.25th_percentile.cumulative',
  'latest.admissions.act_scores.75th_percentile.cumulative',
  'latest.cost.avg_net_price.overall',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.cost.attendance.academic_year',
  'latest.student.size',
  'latest.completion.rate_suppressed.overall',
  'latest.earnings.10_yrs_after_entry.median',
  'latest.earnings.6_yrs_after_entry.median',
  'latest.aid.pell_grant_rate',
  'latest.academics.program_percentage.business_marketing',
  'latest.academics.program_percentage.computer',
  'latest.academics.program_percentage.engineering',
  'latest.academics.program_percentage.health',
  'latest.academics.program_percentage.biological',
  'latest.academics.program_percentage.communication',
  'latest.academics.program_percentage.psychology',
  'school.degrees_awarded.predominant',
].join(',');

// ── Scoring helpers ────────────────────────────────────────────────────────
function scoreAcceptanceEase(rate) {
  if (rate == null) return 5;
  const p = rate * 100;
  if (p <= 10) return 2; if (p <= 20) return 3; if (p <= 30) return 4;
  if (p <= 45) return 5; if (p <= 60) return 6; if (p <= 75) return 7;
  if (p <= 85) return 8; return 9;
}
function scoreEarnings(e) {
  if (!e) return 5;
  if (e >= 90000) return 10; if (e >= 75000) return 9; if (e >= 65000) return 8;
  if (e >= 55000) return 7;  if (e >= 45000) return 6; if (e >= 38000) return 5;
  if (e >= 30000) return 4;  return 3;
}
function scoreTuition(net, ownership) {
  if (!net) return 5;
  const b = ownership === 1 ? 1 : 0;
  if (net <= 10000) return Math.min(10, 10+b); if (net <= 15000) return Math.min(10,9+b);
  if (net <= 20000) return Math.min(10,8+b);   if (net <= 28000) return 7;
  if (net <= 35000) return 6; if (net <= 42000) return 5; if (net <= 50000) return 4;
  return 3;
}
function scoreROI(e, net) {
  if (!e || !net) return 5;
  const y = (net * 4) / e;
  if (y <= 1.5) return 10; if (y <= 2.0) return 9; if (y <= 2.5) return 8;
  if (y <= 3.0) return 7;  if (y <= 4.0) return 6; if (y <= 5.5) return 5;
  if (y <= 7.0) return 4;  return 3;
}
function scoreSize(s) {
  if (!s) return 5;
  if (s >= 3000 && s <= 8000) return 8; if (s >= 8001 && s <= 18000) return 7;
  if (s < 3000) return 6; if (s >= 18001 && s <= 30000) return 6; return 5;
}
function ownershipLabel(o) {
  if (o === 1) return 'Public'; if (o === 2) return 'Private'; return 'For-Profit';
}

// ── Compute weighted score from criteria weights ────────────────────────────
function computeScore(schoolData, weights) {
  if (!weights || Object.keys(weights).length === 0) return 0;
  let total = 0, totalW = 0;
  for (const [id, w] of Object.entries(weights)) {
    if (!w || w <= 0) continue;
    const val = schoolData[id] ?? 5;
    total += val * w;
    totalW += w;
  }
  return totalW === 0 ? 0 : total / totalW;
}


// Boston coords
const BOSTON_LAT = 42.3601;
const BOSTON_LNG = -71.0589;

function calcBostonAccess(lat, lng) {
  if (!lat || !lng) return 5;
  const dist = haversine(BOSTON_LAT, BOSTON_LNG, lat, lng);
  if (dist <= 30)  return 10; // on campus basically
  if (dist <= 60)  return 9;
  if (dist <= 100) return 8;
  if (dist <= 200) return 7;
  if (dist <= 350) return 6;
  if (dist <= 500) return 5;
  if (dist <= 800) return 4;
  if (dist <= 1500)return 3;
  return 2; // cross country
}


function calcStudyAbroad(langPct, ownership) {
  // Private schools and higher foreign language % = more study abroad culture
  const base = ownership === 1 ? 5 : 6; // public vs private base
  if (!langPct) return base;
  if (langPct >= 0.10) return Math.min(10, base + 3);
  if (langPct >= 0.05) return Math.min(10, base + 2);
  if (langPct >= 0.02) return Math.min(10, base + 1);
  return base;
}


function calcAthletics(carnegie, size) {
  // Large research universities tend to have D1 athletics
  if (!size) return 5;
  if (size >= 20000) return 8; // likely D1
  if (size >= 10000) return 7; // likely D1
  if (size >= 5000)  return 6; // likely D1 or D2
  if (size >= 2000)  return 5; // D2 or D3
  return 4;
}

// ── Transform raw Scorecard → school object ────────────────────────────────
function transform(r) {
  const name      = r['school.name'];
  const ownership = r['school.ownership'];
  const sat25r    = r['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0;
  const sat25m    = r['latest.admissions.sat_scores.25th_percentile.math'] || 0;
  const sat75r    = r['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0;
  const sat75m    = r['latest.admissions.sat_scores.75th_percentile.math'] || 0;
  const satLo     = sat25r + sat25m;
  const satHi     = sat75r + sat75m;
  const actLo     = r['latest.admissions.act_scores.25th_percentile.cumulative'];
  const actHi     = r['latest.admissions.act_scores.75th_percentile.cumulative'];
  const netPrice  = r['latest.cost.avg_net_price.overall'];
  const tuitionOut= r['latest.cost.tuition.out_of_state'];
  const coa       = r['latest.cost.attendance.academic_year'];
  const acceptRate= r['latest.admissions.admission_rate.overall'];
  const earnings10= r['latest.earnings.10_yrs_after_entry.median'];
  const size      = r['latest.student.size'];
  const pellRate  = r['latest.aid.pell_grant_rate'];
  const hasBiz    = (r['latest.academics.program_percentage.business_marketing'] || 0) > 0.01;
  const hasCS     = (r['latest.academics.program_percentage.computer'] || 0) > 0.01;
  const satMid    = satLo && satHi ? Math.round((satLo + satHi) / 2) : null;
  const gpaAvg    = satMid ? Math.min(4.0, Math.max(2.0, (satMid - 400) / 300 + 2.5)) : 3.0;
  const sizeScore = scoreSize(size);
  const meritScore= Math.max(2, 10 - scoreAcceptanceEase(acceptRate) + 2);
  const diversityScore = pellRate ? Math.min(10, Math.round(pellRate * 15) + 3) : 5;
  const coaSticker= coa || (tuitionOut ? tuitionOut + 16000 : null);

  const data = {
    job_placement:    scoreEarnings(earnings10),
    roi:              scoreROI(earnings10, netPrice),
    tuition_value:    scoreTuition(netPrice, ownership),
    diversity:        diversityScore,
    social_life:      sizeScore,
    safety:           6,
    boston_access:    calcBostonAccess(r['school.latitude'], r['school.longitude']),
    coop_internship:  hasBiz ? 6 : 5,
    ai_readiness:     hasCS ? 7 : 5,
    wsj_rank:         5, usnews_rank: 5, linkedin_rank: 5,
    niche_rank:       5, forbes_rank:  5,
    pq_rank:          hasBiz ? 5 : 0,
    finance_rank:     hasBiz ? 5 : 3,
    merit_scholarship:meritScore,
    acceptance_ease:  scoreAcceptanceEase(acceptRate),
    campus_beauty:    6,
    class_size:       sizeScore > 7 ? 8 : sizeScore > 5 ? 6 : 4,
    athletics:        calcAthletics(r['school.carnegie_size_setting'], r['latest.student.size']),
    greek_life:       ownership === 2 ? 6 : 5,
    study_abroad:     calcStudyAbroad(r['latest.academics.program_percentage.foreign_language'], r['school.ownership']),
    research_opps:    size > 15000 ? 8 : 6,
    alumni_loyalty:   6,
  };

  return {
    id:           `sc_${r.id}`,
    scorecardId:  r.id,
    name,
    location:     `${r['school.city']}, ${r['school.state']}`,
    city:         r['school.city'],
    state:        r['school.state'],
    type:         ownershipLabel(ownership),
    url:          r['school.school_url'] ? `https://${r['school.school_url']}` : null,
    accept_rate:  acceptRate ? Math.round(acceptRate * 1000) / 10 : null,
    sat_lo:       satLo > 0 ? satLo : null,
    sat_hi:       satHi > 0 ? satHi : null,
    act_lo:       actLo || null,
    act_hi:       actHi || null,
    gpa_avg:      Math.round(gpaAvg * 100) / 100,
    coa_sticker:  coaSticker || null,
    coa_net:      netPrice || null,
    earnings_10yr:earnings10,
    size,
    lat:          r['school.latitude'],
    lng:          r['school.longitude'],
    data,
  };
}

// ── Haversine distance (miles) ────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── Fetch ALL schools from Scorecard matching basic criteria ──────────────
async function fetchAllSchools(apiKey, search, state) {
  const cacheKey = `all_${search||''}_${state||''}`;
  const cached = schoolCache.get(cacheKey);
  if (cached) return cached;

  const allSchools = [];
  const perPage = 100;
  let page = 0;
  let hasMore = true;

  while (hasMore && page < 20) { // max 2000 schools
    const params = new URLSearchParams({
      api_key: apiKey,
      fields: SCORECARD_FIELDS,
      per_page: perPage,
      page,
      'latest.earnings.10_yrs_after_entry.median__range': '10000..',
      'school.degrees_awarded.predominant__range': '3..4',
    });
    if (state) params.set('school.state', state.toUpperCase());
    if (search) params.set('school.name', search);

    const res = await fetch(`${SCORECARD_BASE}?${params}`, { timeout: 20000 });
    if (!res.ok) throw new Error(`Scorecard API ${res.status}`);
    const json = await res.json();
    const batch = (json.results || []).map(r => enrich(transform(r)));
    allSchools.push(...batch);

    if (batch.length < perPage) hasMore = false;
    else page++;
  }

  schoolCache.set(cacheKey, allSchools);
  return allSchools;
}

// ── Main route: GET /api/schools ──────────────────────────────────────────
// All filtering, scoring, and sorting happens SERVER-SIDE so pagination works correctly
router.get('/', async (req, res) => {
  try {
    const {
      page = 1, perPage = 50,
      state, search,
      // Admission filters
      gpaMin, gpaMax,
      satMin, satMax,
      actMin, actMax,
      coaMax,
      // Location filter
      userLat, userLng, maxMiles,
      // Criteria weights (JSON string)
      weights: weightsStr,
    } = req.query;

    const apiKey = process.env.SCORECARD_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'SCORECARD_API_KEY not configured' });

    // 1. Fetch all schools (cached after first call)
    let schools = await fetchAllSchools(apiKey, search, state);

    // 2. Parse criteria weights
    let weights = {};
    if (weightsStr) {
      try { weights = JSON.parse(weightsStr); } catch(e) {}
    }

    // 3. Score every school with the provided weights
    schools = schools.map(s => ({
      ...s,
      score: computeScore(s.data, weights),
    }));

    // 4. Apply admission filters
    schools = schools.filter(s => {
      // GPA filter
      if (gpaMin || gpaMax) {
        const lo = parseFloat(gpaMin || '0');
        const hi = parseFloat(gpaMax || '4.0');
        if (s.gpa_avg < lo || s.gpa_avg > hi) return false;
      }
      // SAT overlap filter
      if (satMin || satMax) {
        const lo = parseFloat(satMin || '0');
        const hi = parseFloat(satMax || '1600');
        if (s.sat_lo && s.sat_hi) {
          if (s.sat_lo > hi || s.sat_hi < lo) return false;
        }
      }
      // ACT overlap filter
      if (actMin || actMax) {
        const lo = parseFloat(actMin || '0');
        const hi = parseFloat(actMax || '36');
        if (s.act_lo && s.act_hi) {
          if (s.act_lo > hi || s.act_hi < lo) return false;
        }
      }
      // COA filter
      if (coaMax && parseFloat(coaMax) < 100000) {
        if (s.coa_sticker && s.coa_sticker > parseFloat(coaMax)) return false;
      }
      // Distance filter
      if (userLat && userLng && maxMiles && parseFloat(maxMiles) < 9999) {
        if (!s.lat || !s.lng) return false;
        const dist = haversine(parseFloat(userLat), parseFloat(userLng), s.lat, s.lng);
        if (dist > parseFloat(maxMiles)) return false;
        s.distance = Math.round(dist); // attach distance for display
      }
      return true;
    });

    // 5. Sort by score descending
    schools.sort((a, b) => b.score - a.score);

    // 6. Paginate
    const total = schools.length;
    const pageNum = parseInt(page);
    const pageSize = Math.min(parseInt(perPage), 100);
    const start = (pageNum - 1) * pageSize;
    const pageSchools = schools.slice(start, start + pageSize);

    res.json({
      schools: pageSchools,
      total,
      page: pageNum,
      perPage: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });

  } catch (err) {
    console.error('Schools route error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Single school detail
router.get('/:id', async (req, res) => {
  try {
    const apiKey = process.env.SCORECARD_API_KEY;
    const scorecardId = req.params.id.replace('sc_', '');
    const cacheKey = `school_${scorecardId}`;
    const cached = schoolCache.get(cacheKey);
    if (cached) return res.json(cached);

    const params = new URLSearchParams({ api_key: apiKey, fields: SCORECARD_FIELDS });
    const response = await fetch(`${SCORECARD_BASE}/${scorecardId}?${params}`, { timeout: 10000 });
    if (!response.ok) return res.status(404).json({ error: 'School not found' });
    const json = await response.json();
    const school = transform(json.results?.[0] || json);
    schoolCache.set(cacheKey, school);
    res.json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
