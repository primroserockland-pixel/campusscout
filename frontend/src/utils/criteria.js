// ── Criteria definitions ──────────────────────────────────────────────────
export const ALL_CRITERIA = [
  // Career Outcomes
  { id:'job_placement',  label:'Job Placement & Salary', icon:'🚀', group:'Career Outcomes',  defaultWeight:12, defaultOn:true,  desc:'Employment rate + starting salary within 6 months of graduation' },
  { id:'coop_internship',label:'Co-op / Internship',     icon:'🤝', group:null,               defaultWeight:7,  defaultOn:true,  desc:'Formal co-op or internship infrastructure built into the curriculum' },
  { id:'ai_readiness',   label:'AI Curriculum Readiness',icon:'🤖', group:null,               defaultWeight:5,  defaultOn:true,  desc:'How well the school prepares students for AI-driven workplaces' },
  // Rankings
  { id:'finance_rank',   label:'Undergraduate Program Rank', icon:'📊', group:'Rankings',     defaultWeight:10, defaultOn:true,  desc:'Program ranking driven by the major selected above' },
  { id:'wsj_rank',       label:'WSJ Ranking',            icon:'📰', group:null,               defaultWeight:9,  defaultOn:true,  desc:'Wall Street Journal — 70% weighted on student outcomes & salary' },
  { id:'usnews_rank',    label:'US News Ranking',         icon:'🏛️', group:null,               defaultWeight:5,  defaultOn:true,  desc:'US News & World Report national university ranking' },
  { id:'linkedin_rank',  label:'LinkedIn Career Rank',    icon:'💼', group:null,               defaultWeight:5,  defaultOn:true,  desc:'LinkedIn Top Colleges — real alumni career outcomes' },
  { id:'niche_rank',     label:'Niche Overall Rank',      icon:'⭐', group:null,               defaultWeight:4,  defaultOn:true,  desc:'Niche.com — student reviews + academics + campus life + value' },
  { id:'forbes_rank',    label:'Forbes Rank',             icon:'💹', group:null,               defaultWeight:4,  defaultOn:true,  desc:'Forbes Top Colleges — alumni earnings, student debt, graduation rates' },
  { id:'pq_rank',        label:'Poets & Quants Rank',     icon:'🎓', group:null,               defaultWeight:4,  defaultOn:true,  desc:'Poets & Quants undergrad business ranking. Auto-hidden for non-business majors.' },
  // Financial
  { id:'roi',            label:'Return on Investment',    icon:'💰', group:'Financial',        defaultWeight:9,  defaultOn:true,  desc:'ROI — salary outcomes relative to total tuition cost' },
  { id:'tuition_value',  label:'Tuition / Cost Value',    icon:'🏷️', group:null,               defaultWeight:5,  defaultOn:true,  desc:'Net tuition after financial aid — lower cost scores higher' },
  // Campus Life
  { id:'diversity',      label:'Campus Diversity',        icon:'🌍', group:'Campus Life',      defaultWeight:5,  defaultOn:true,  desc:'Racial, ethnic, cultural, and international student diversity' },
  { id:'social_life',    label:'Social Life',             icon:'🎉', group:null,               defaultWeight:4,  defaultOn:true,  desc:'Campus social scene, events, activities, fun factor' },
  { id:'safety',         label:'Campus Safety',           icon:'🛡️', group:null,               defaultWeight:4,  defaultOn:true,  desc:'Crime rates, campus security, student-reported safety perception' },
  // Location
  { id:'boston_access',  label:'Access to Boston',        icon:'🏠', group:'Location & Access',defaultWeight:5,  defaultOn:true,  desc:'How easy to get home to Boston — drive time, transit options' },
  // Secondary / Academics
  { id:'class_size',     label:'Class Size / Faculty Ratio', icon:'👩‍🏫', group:'Academics',  defaultWeight:0,  defaultOn:false, desc:'Lower student-faculty ratio = more personal attention' },
  { id:'research_opps',  label:'Research Opportunities',  icon:'🔬', group:null,               defaultWeight:0,  defaultOn:false, desc:'Undergraduate research labs, projects, faculty research involvement' },
  { id:'study_abroad',   label:'Study Abroad',            icon:'✈️', group:null,               defaultWeight:0,  defaultOn:false, desc:'International study programs, exchange opportunities' },
  { id:'alumni_loyalty', label:'Alumni Network Loyalty',  icon:'🤲', group:null,               defaultWeight:0,  defaultOn:false, desc:'How actively alumni help current students — mentoring, hiring' },
  // Admissions
  { id:'merit_scholarship', label:'Scholarship Odds',     icon:'🎓', group:'Admissions & Aid', defaultWeight:0, defaultOn:false, desc:'Likelihood of receiving merit scholarship' },
  { id:'acceptance_ease',   label:'Admissions Accessibility', icon:'📋', group:null,           defaultWeight:0, defaultOn:false, desc:'Ease of admission — higher score = more accessible' },
  // Social
  { id:'athletics',      label:'Athletics & Sports',      icon:'🏀', group:'Social & Culture', defaultWeight:0, defaultOn:false, desc:'Strength of athletic programs and sports fan culture' },
  { id:'greek_life',     label:'Greek Life',              icon:'🏛️', group:null,               defaultWeight:0,  defaultOn:false, desc:'Presence and quality of Greek system' },
  { id:'campus_beauty',  label:'Campus Beauty',           icon:'🌿', group:null,               defaultWeight:0,  defaultOn:false, desc:'Campus aesthetics, architecture, greenery, facilities' },
];

export const BUSINESS_MAJOR_IDS = [
  'business_finance','business_accounting','business_marketing','business_mgmt','business_entrepreneurship'
];

// ── Major definitions ────────────────────────────────────────────────────
export const MAJORS = {
  business_finance:       { label:'Business Finance',       emoji:'💼', programFilter:'business' },
  business_accounting:    { label:'Business Accounting',    emoji:'📒', programFilter:'business' },
  business_marketing:     { label:'Business Marketing',     emoji:'📣', programFilter:'business' },
  business_mgmt:          { label:'Business Management',    emoji:'🏢', programFilter:'business' },
  business_entrepreneurship:{ label:'Entrepreneurship',     emoji:'🚀', programFilter:'business' },
  computer_science:       { label:'Computer Science',        emoji:'💻', programFilter:'cs' },
  data_science:           { label:'Data Science',            emoji:'📊', programFilter:'cs' },
  cybersecurity:          { label:'Cybersecurity',           emoji:'🔐', programFilter:'cs' },
  ai_ml:                  { label:'AI / Machine Learning',   emoji:'🤖', programFilter:'cs' },
  engineering:            { label:'Engineering',             emoji:'⚙️', programFilter:'engineering' },
  biology:                { label:'Biology / Life Sciences', emoji:'🧬', programFilter:'biology' },
  chemistry:              { label:'Chemistry / Biochemistry',emoji:'🧪', programFilter:'biology' },
  math_stats:             { label:'Math / Statistics',       emoji:'📐', programFilter:null },
  psychology:             { label:'Psychology',              emoji:'🧠', programFilter:null },
  communications:         { label:'Communications / Media',  emoji:'📡', programFilter:null },
  political_science:      { label:'Political Science / Pre-Law', emoji:'🏛', programFilter:null },
  economics:              { label:'Economics',               emoji:'📈', programFilter:null },
  english:                { label:'English / Creative Writing', emoji:'📖', programFilter:null },
  history:                { label:'History',                 emoji:'🏺', programFilter:null },
  nursing:                { label:'Nursing / Health Sciences',emoji:'🏥', programFilter:'health' },
  premed:                 { label:'Pre-Med / Biology',       emoji:'⚕️', programFilter:'biology' },
  public_health:          { label:'Public Health',           emoji:'🌐', programFilter:'health' },
  architecture:           { label:'Architecture',            emoji:'🏗', programFilter:null },
  graphic_design:         { label:'Graphic Design / Visual Arts', emoji:'🎨', programFilter:null },
};

// ── Major weight presets ──────────────────────────────────────────────────
export const MAJOR_WEIGHTS = {
  business_finance: {
    job_placement:12, coop_internship:7, ai_readiness:5,
    finance_rank:10, wsj_rank:9, usnews_rank:5, linkedin_rank:5, niche_rank:4, forbes_rank:4, pq_rank:4,
    roi:9, tuition_value:5, diversity:5, social_life:4, safety:4, boston_access:5,
  },
  business_accounting: {
    job_placement:12, coop_internship:7, ai_readiness:4,
    finance_rank:12, wsj_rank:9, usnews_rank:5, linkedin_rank:5, niche_rank:4, forbes_rank:4, pq_rank:4,
    roi:9, tuition_value:5, diversity:5, social_life:3, safety:4, boston_access:5,
  },
  computer_science: {
    job_placement:13, coop_internship:9, ai_readiness:11,
    finance_rank:0, wsj_rank:6, usnews_rank:7, linkedin_rank:6, niche_rank:4, forbes_rank:4, pq_rank:0,
    roi:8, tuition_value:4, diversity:6, social_life:3, safety:4, boston_access:5,
    research_opps:7, class_size:7,
  },
  engineering: {
    job_placement:13, coop_internship:10, ai_readiness:8,
    finance_rank:0, wsj_rank:8, usnews_rank:8, linkedin_rank:7, niche_rank:4, forbes_rank:4, pq_rank:0,
    roi:10, tuition_value:6, diversity:6, social_life:4, safety:5, boston_access:5,
    research_opps:10, class_size:8,
  },
  nursing: {
    job_placement:15, coop_internship:8, ai_readiness:4,
    finance_rank:0, wsj_rank:5, usnews_rank:10, linkedin_rank:5, niche_rank:5, forbes_rank:4, pq_rank:0,
    roi:10, tuition_value:7, diversity:8, social_life:5, safety:8, boston_access:7,
    research_opps:8, class_size:9,
  },
  premed: {
    job_placement:10, coop_internship:6, ai_readiness:4,
    finance_rank:0, wsj_rank:5, usnews_rank:13, linkedin_rank:5, niche_rank:6, forbes_rank:5, pq_rank:0,
    roi:8, tuition_value:6, diversity:9, social_life:6, safety:7, boston_access:7,
    research_opps:16, class_size:11,
  },
};

export function getMajorWeights(majorId) {
  return MAJOR_WEIGHTS[majorId] || MAJOR_WEIGHTS['business_finance'];
}

// ── Program rank labels ───────────────────────────────────────────────────
export const PROGRAM_RANK_LABELS = {
  business_finance:       { label:'Finance Undergrad Rank',     desc:'How each school ranks for undergraduate Finance — US News, College Factual, Poets & Quants.' },
  business_accounting:    { label:'Accounting Undergrad Rank',  desc:'Undergraduate Accounting — Big 4 recruiting, CPA pass rates.' },
  business_marketing:     { label:'Marketing Undergrad Rank',   desc:'Undergraduate Marketing — ad agencies, brand management, digital.' },
  business_mgmt:          { label:'Management Undergrad Rank',  desc:'Undergraduate Business Management.' },
  business_entrepreneurship:{ label:'Entrepreneurship Rank',   desc:'Entrepreneurship — accelerators, VC access, startup culture.' },
  computer_science:       { label:'CS Undergrad Rank',          desc:'Computer Science ranking — US News, CSRankings.org.' },
  data_science:           { label:'Data Science Rank',          desc:'Data Science / Analytics program quality.' },
  cybersecurity:          { label:'Cybersecurity Rank',         desc:'Cybersecurity — NSA designations, employer demand.' },
  ai_ml:                  { label:'AI / ML Program Rank',       desc:'AI & Machine Learning — research labs, faculty, industry ties.' },
  engineering:            { label:'Engineering Undergrad Rank', desc:'Engineering — ABET accreditation, US News, employer recruiting.' },
  biology:                { label:'Biology / Life Sci Rank',    desc:'Biology — research output, lab access, grad/med school pipeline.' },
  chemistry:              { label:'Chemistry / Biochem Rank',   desc:'Chemistry — research facilities, faculty publications.' },
  math_stats:             { label:'Math / Stats Rank',          desc:'Mathematics & Statistics — quant rigor, PhD pipeline.' },
  psychology:             { label:'Psychology Program Rank',    desc:'Psychology — research labs, clinical experience, grad school.' },
  communications:         { label:'Communications Rank',        desc:'Communications / Media — journalism, broadcast, PR.' },
  political_science:      { label:'Poli-Sci / Pre-Law Rank',    desc:'Political Science — law school placement rates.' },
  economics:              { label:'Economics Undergrad Rank',   desc:'Economics — quantitative rigor, grad school pipeline.' },
  english:                { label:'English / Writing Rank',     desc:'English & Creative Writing — faculty, MFA pipeline.' },
  history:                { label:'History Program Rank',       desc:'History — faculty research, grad school placement.' },
  nursing:                { label:'Nursing / Health Sci Rank',  desc:'Nursing — ACEN/CCNE accreditation, NCLEX pass rates.' },
  premed:                 { label:'Pre-Med Track Rank',         desc:'Pre-med — medical school acceptance rates, research access.' },
  public_health:          { label:'Public Health Rank',         desc:'Public Health — CEPH accreditation, MPH pipeline.' },
  architecture:           { label:'Architecture Program Rank',  desc:'Architecture — NAAB accreditation, studio quality.' },
  graphic_design:         { label:'Design / Visual Arts Rank',  desc:'Graphic Design — portfolio outcomes, industry placements.' },
};

export function getProgramRankLabel(majorId) {
  return PROGRAM_RANK_LABELS[majorId] || PROGRAM_RANK_LABELS['business_finance'];
}
