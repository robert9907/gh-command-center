import { getLiveCountyUrl } from './livePages.js';

function getField(data, name) {
  if (name === 'county_slug') return data.county.toLowerCase().replace(/\s+/g, '-');
  if (!(name in data)) return undefined;
  return data[name];
}

function renderEachBlocks(template, data) {
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  return template.replace(eachRegex, (_match, arrayName, body) => {
    const arr = getField(data, arrayName);
    if (!Array.isArray(arr)) throw new Error(`{{#each ${arrayName}}} — not an array`);
    const isNeighborBlock = arrayName === 'neighboring_counties';
    return arr.map((item) => {
      if (item === undefined || item === null) throw new Error('Array item is null');
      const itemStr = String(item);
      const itemSlug = itemStr.toLowerCase().replace(/\s+/g, '-');
      if (isNeighborBlock) {
        const liveUrl = getLiveCountyUrl(itemSlug);
        if (!liveUrl) return `<span style="color:#6E6E73;padding:8px 16px;background:#FBFBFD;border:1px solid #E5E5EA;border-radius:8px;font-size:15px;">${itemStr}</span>\n`;
      }
      return body
        .replace(/\{\{this_slug\}\}/g, () => itemSlug)
        .replace(/\{\{this\}\}/g, () => itemStr);
    }).join('');
  });
}

function renderArrayIndexes(template, data) {
  const arrayIndexRegex = /\{\{(\w+)\[(\d+)\]\}\}/g;
  return template.replace(arrayIndexRegex, (_match, name, indexStr) => {
    const arr = getField(data, name);
    if (!Array.isArray(arr)) throw new Error(`{{${name}[${indexStr}]}} — not an array`);
    const index = parseInt(indexStr, 10);
    if (index < 0 || index >= arr.length) throw new Error(`{{${name}[${indexStr}]}} — out of bounds`);
    const val = arr[index];
    if (val === undefined || val === null) throw new Error(`{{${name}[${indexStr}]}} — null`);
    return String(val);
  });
}

function renderSimpleVars(template, data) {
  const varRegex = /\{\{(\w+)\}\}/g;
  return template.replace(varRegex, (_match, name) => {
    if (name === 'this' || name === 'this_slug')
      throw new Error(`{{${name}}} outside of {{#each}} block`);
    const val = getField(data, name);
    if (val === undefined || val === null) throw new Error(`Unresolved: {{${name}}}`);
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  });
}

export function renderTemplate(template, data) {
  let output = renderEachBlocks(template, data);
  output = renderArrayIndexes(output, data);
  output = renderSimpleVars(output, data);
  return output;
}

// ── County-specific H1 generator ────────────────────────────────────────────
// Fix #1: H1 must be county-specific, not a template swap
export function generateCountyH1(data) {
  const { county, health_system, hospitals, specialties, metro_area, population } = data;

  // Use primary hospital name if specific enough
  const primaryHospital = hospitals?.[0] || health_system;

  // Use cancer specialty if available (highest fear/urgency)
  const cancerSpec = specialties?.find(s => s.toLowerCase().includes('cancer'));
  const heartSpec = specialties?.find(s => s.toLowerCase().includes('heart'));

  // Population-based phrasing
  const popNum = parseInt(population || '0', 10);
  const isLarge = popNum > 200000;
  const isSmall = popNum < 30000;

  // Metro context
  const metroContext = metro_area ? ` in the ${metro_area} area` : '';

  // Generate unique H1 based on county characteristics
  if (cancerSpec && primaryHospital.includes(health_system)) {
    return `Does your Medicare plan actually cover ${primaryHospital} cancer specialists?`;
  }
  if (heartSpec && isLarge) {
    return `Which Medicare plans cover your ${health_system} cardiologist in ${county} County?`;
  }
  if (isSmall) {
    return `Medicare in ${county} County: Will your plan cover ${health_system} or send you out of county?`;
  }
  if (metro_area) {
    return `${county} County Medicare: Which plans actually cover ${health_system} doctors${metroContext}?`;
  }
  return `Medicare in ${county} County NC: Does your plan cover ${health_system}?`;
}
