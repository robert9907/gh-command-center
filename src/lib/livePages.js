// Counties with live pages on generationhealth.me
// Add new entries as pages go live
export const LIVE_COUNTY_URLS = new Map([
  ['durham',      'https://generationhealth.me/medicare-agents-in-durham-county-nc/'],
  ['wake',        'https://generationhealth.me/medicare-agents-in-wake-county-nc/'],
  ['orange',      'https://generationhealth.me/medicare-agents-in-orange-county-nc/'],
  ['guilford',    'https://generationhealth.me/medicare-agents-in-guilford-county-nc/'],
  ['forsyth',     'https://generationhealth.me/medicare-agents-in-forsyth-county-nc/'],
  ['buncombe',    'https://generationhealth.me/medicare-agents-in-buncombe-county-nc/'],
  ['mecklenburg', 'https://generationhealth.me/medicare-agents-in-mecklenburg-north-carolina/'],
  // Uncomment as pages go live:
  // ['cabarrus',    'https://generationhealth.me/medicare-agents-in-cabarrus-county-nc/'],
  // ['chatham',     'https://generationhealth.me/medicare-agents-in-chatham-county-nc/'],
  // ['alamance',    'https://generationhealth.me/medicare-agents-in-alamance-county-nc/'],
  // ['henderson',   'https://generationhealth.me/medicare-agents-in-henderson-county-nc/'],
  // ['new-hanover', 'https://generationhealth.me/medicare-agents-in-new-hanover-county-nc/'],
]);

export function getLiveCountyUrl(slug) {
  return LIVE_COUNTY_URLS.get(slug) ?? null;
}

export function isCountyLive(slug) {
  return LIVE_COUNTY_URLS.has(slug);
}

export function getLiveCountyCount() {
  return LIVE_COUNTY_URLS.size;
}
