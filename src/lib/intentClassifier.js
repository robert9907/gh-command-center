export const NC_COUNTIES = [
  'Alamance','Alexander','Alleghany','Anson','Ashe','Avery','Beaufort','Bertie',
  'Bladen','Brunswick','Buncombe','Burke','Cabarrus','Caldwell','Camden','Carteret',
  'Caswell','Catawba','Chatham','Cherokee','Chowan','Clay','Cleveland','Columbus',
  'Craven','Cumberland','Currituck','Dare','Davidson','Davie','Duplin','Durham',
  'Edgecombe','Forsyth','Franklin','Gaston','Gates','Graham','Granville','Greene',
  'Guilford','Halifax','Harnett','Haywood','Henderson','Hertford','Hoke','Hyde',
  'Iredell','Jackson','Johnston','Jones','Lee','Lenoir','Lincoln','Macon','Madison',
  'Martin','McDowell','Mecklenburg','Mitchell','Montgomery','Moore','Nash',
  'New Hanover','Northampton','Onslow','Orange','Pamlico','Pasquotank','Pender',
  'Perquimans','Person','Pitt','Polk','Randolph','Richmond','Robeson','Rockingham',
  'Rowan','Rutherford','Sampson','Scotland','Stanly','Stokes','Surry','Swain',
  'Transylvania','Tyrrell','Union','Vance','Wake','Warren','Washington','Watauga',
  'Wayne','Wilkes','Wilson','Yadkin','Yancey',
];

const CITY_TO_COUNTY = {
  'Raleigh':'Wake','Cary':'Wake','Apex':'Wake','Morrisville':'Wake',
  'Wake Forest':'Wake','Durham':'Durham','Chapel Hill':'Orange',
  'Carrboro':'Orange','Hillsborough':'Orange','Greensboro':'Guilford',
  'High Point':'Guilford','Winston-Salem':'Forsyth','Burlington':'Alamance',
  'Charlotte':'Mecklenburg','Concord':'Cabarrus','Asheville':'Buncombe',
  'Hendersonville':'Henderson','Boone':'Watauga','Wilmington':'New Hanover',
  'Greenville':'Pitt','Fayetteville':'Cumberland',
};

const HIGH_INTENT_KEYWORDS = [
  'broker','brokers','agent','agents','advisor','advisors','help','enroll',
  'sign up','signup','find','finding','need','needs','looking for',
  'hire','consultation','appointment','near me',
];

const URGENCY_KEYWORDS = [
  'deadline','turning 65','turn 65','lost coverage','losing coverage','retiring',
  'retirement','need help now','urgent','immediately','asap','cobra ending',
  'just diagnosed','sep','special enrollment',
];

const CATEGORY_PATTERNS = [
  { category:'aca', patterns:[
    /\baca\b/i,/\bobamacare\b/i,/\baffordable care act\b/i,
    /\bmarketplace\b.*\b(health|insurance|plan)/i,/\bpremium tax credit\b/i,
  ]},
  { category:'savings_programs', patterns:[
    /\bextra help\b/i,/\blis\b/i,/\bmedicare savings program\b/i,
    /\bqmb\b/i,/\bslmb\b/i,/\bmedicaid\b/i,/\bdual eligible\b/i,
  ]},
  { category:'authority_builders', patterns:[
    /\badvantage vs (medigap|supplement)/i,/\bmedigap vs advantage\b/i,
    /\bhow (does|do) medicare\b/i,/\bwhat is (a )?medicare\b/i,
    /\bcompare medicare\b/i,/\bmedicare guide\b/i,
  ]},
  { category:'local_decisions', patterns:[
    /\bturning 65\b/i,/\bturn 65\b/i,/\benrollment (period|deadline)\b/i,
    /\baep\b/i,/\bsep\b/i,/\bspecial enrollment\b/i,
    /\blost (my )?coverage\b/i,/\bretir(e|ing|ement)\b/i,
  ]},
];

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function buildRx(name) { return new RegExp('\\b' + escapeRegex(name) + '\\b', 'i'); }

export function extractCounty(query) {
  if (!query) return null;
  for (const city of Object.keys(CITY_TO_COUNTY)) {
    if (buildRx(city).test(query)) return CITY_TO_COUNTY[city];
  }
  for (const county of NC_COUNTIES) {
    if (buildRx(county).test(query)) return county;
  }
  return null;
}

export function categorizeQuery(query) {
  if (!query) return 'local_decisions';
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    if (patterns.some(p => p.test(query))) return category;
  }
  if (extractCounty(query)) return 'county_city';
  if (/\b(nc|north carolina)\b/i.test(query)) return 'regional';
  return 'local_decisions';
}

function hasHighIntent(lower) {
  return HIGH_INTENT_KEYWORDS.some(kw =>
    kw.includes(' ') ? lower.includes(kw) : new RegExp('\\b' + kw + '\\b','i').test(lower)
  );
}

export function calculateIntentScore(query, upvotes) {
  if (!query) return 1;
  const lower = query.toLowerCase();
  let score = 5;
  if (hasHighIntent(lower)) score += 3;
  if (extractCounty(query)) score += 2;
  if (URGENCY_KEYWORDS.some(kw => lower.includes(kw))) score += 2;
  if (typeof upvotes === 'number' && upvotes > 20) score += 1;
  return Math.max(1, Math.min(10, score));
}

export function scoreToLevel(score) {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

export function classifyIntent(queries) {
  return queries.map(q => {
    const score = calculateIntentScore(q.query, q.upvotes);
    const level = scoreToLevel(score);
    const category = categorizeQuery(q.query);
    const county = extractCounty(q.query);
    return { ...q, intent: level, intentScore: score, category, ...(county ? { county } : {}) };
  });
}
