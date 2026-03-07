#!/usr/bin/env node
/**
 * Merges new entries from screenshots into directory.json.
 * - Converts to DirectoryEntry format
 * - Dedupes by handle (id)
 * - Updates existing or appends
 * - Normalizes location, modality, trims descriptions to 120 chars
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIR_DATA = join(ROOT, 'src/data/directory.json');
const NEW_ENTRIES_PATH = join(__dirname, 'new-entries-from-screenshots.json');

const LOCATION_TO_STATE_CITY = {
  'CDMX': { state: 'CDMX', city: 'Ciudad de México' },
  'Nacional': { state: '', city: '' },
  'Guadalajara': { state: 'Jalisco', city: 'Guadalajara' },
  'Monterrey': { state: 'Nuevo León', city: 'Monterrey' },
  'Mérida': { state: 'Yucatán', city: 'Mérida' },
  'Puebla': { state: 'Puebla', city: 'Puebla' },
  'Querétaro': { state: 'Querétaro', city: 'Querétaro' },
  'Tijuana': { state: 'Baja California', city: 'Tijuana' },
  'Oaxaca': { state: 'Oaxaca', city: 'Oaxaca' },
  'Xalapa': { state: 'Veracruz', city: 'Xalapa' },
  'Chetumal': { state: 'Quintana Roo', city: 'Chetumal' },
  'Morelia': { state: 'Michoacán', city: 'Morelia' },
  'Uruapan': { state: 'Michoacán', city: 'Uruapan' },
  'Estado de México': { state: 'Estado de México', city: '' },
};

function categoryToTypes(category) {
  switch (category) {
    case 'psychologists':
      return ['psychological support'];
    case 'lawyers':
      return ['legal support'];
    case 'organizations':
      return ['community support'];
    case 'health':
      return ['sexual health', 'reproductive rights'];
    default:
      return ['psychological support'];
  }
}

function getCost(notes) {
  if (!Array.isArray(notes)) return 'consult directly';
  if (notes.some(n => n && n.toLowerCase().includes('gratuita'))) return 'free';
  if (notes.some(n => n && n.toLowerCase().includes('cuota diferenciada'))) return 'variable';
  return 'consult directly';
}

function getPopulation(notes) {
  if (!Array.isArray(notes)) return ['women', 'general public'];
  const hasViolencia = notes.some(n => n && (n.includes('violencia sexual') || n.includes('violencia de género') || n.includes('abuso')));
  if (hasViolencia) return ['survivors of sexual violence', 'women'];
  return ['women', 'general public'];
}

function parseContact(contact) {
  if (!contact || typeof contact !== 'string') return {};
  const trimmed = contact.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.includes('@') && trimmed.includes('.')) return { website: `mailto:${trimmed}` };
  if (digits.length >= 10) return { phone: trimmed.replace(/\D/g, '').replace(/^52/, '') };
  return {};
}

function toDirectoryEntry(raw) {
  const handle = (raw.handle || '').replace(/^@/, '').toLowerCase().trim();
  if (!handle) return null;
  const id = handle.replace(/[^a-z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || handle;
  const desc = (raw.description || '').trim().slice(0, 120);
  const notes = Array.isArray(raw.notes) ? raw.notes : [];
  const cost = getCost(notes);
  const population = getPopulation(notes);
  const modality = (raw.modality || '').toLowerCase();
  const online = modality.includes('online') || modality.includes('nacional');
  const loc = (raw.location || '').trim() || 'Nacional';
  const { state = '', city = '' } = LOCATION_TO_STATE_CITY[loc] || { state: '', city: loc || '' };
  const { phone, website } = parseContact(raw.contact);
  const name = (raw.name || '').trim() || (raw.handle ? raw.handle.replace(/^@/, '') : '');

  return {
    id,
    name: name || handle,
    instagram: handle,
    website: website || undefined,
    phone: phone ? phone.replace(/\D/g, '') : undefined,
    whatsapp: undefined,
    location: loc || 'Nacional',
    country: 'Mexico',
    state,
    city: city || (loc && !LOCATION_TO_STATE_CITY[loc] ? loc : ''),
    type: categoryToTypes(raw.category),
    cost,
    population,
    online,
    description: desc || (raw.category === 'psychologists' ? 'Psicóloga.' : raw.category === 'lawyers' ? 'Abogada.' : 'Recurso de apoyo.'),
  };
}

const newRaw = JSON.parse(readFileSync(NEW_ENTRIES_PATH, 'utf8'));
const existing = JSON.parse(readFileSync(DIR_DATA, 'utf8'));

const byId = new Map();
for (const e of existing) byId.set(e.id, { ...e });

for (const raw of newRaw) {
  const entry = toDirectoryEntry(raw);
  if (!entry) continue;
  const existingEntry = byId.get(entry.id);
  if (existingEntry) {
    const merged = { ...existingEntry };
    if (entry.description && entry.description.length > (merged.description || '').length) merged.description = entry.description;
    if (entry.location && !merged.location) merged.location = entry.location;
    if (entry.state !== undefined && !merged.state) merged.state = entry.state;
    if (entry.city !== undefined && !merged.city) merged.city = entry.city;
    if (entry.phone && !merged.phone) merged.phone = entry.phone;
    if (entry.whatsapp && !merged.whatsapp) merged.whatsapp = entry.whatsapp;
    if (entry.website && !merged.website) merged.website = entry.website;
    if (entry.name && entry.name !== entry.id && !merged.name) merged.name = entry.name;
    merged.online = entry.online;
    byId.set(entry.id, merged);
  } else {
    byId.set(entry.id, entry);
  }
}

const mergedList = Array.from(byId.values());
writeFileSync(DIR_DATA, JSON.stringify(mergedList, null, 2) + '\n', 'utf8');

const byCategory = { psychologists: [], lawyers: [], organizations: [], health: [] };
for (const e of mergedList) {
  if (e.type && e.type.includes('psychological support')) byCategory.psychologists.push(e);
  if (e.type && e.type.includes('legal support')) byCategory.lawyers.push(e);
  if (e.type && e.type.includes('community support')) byCategory.organizations.push(e);
  if (e.type && (e.type.includes('sexual health') || e.type.includes('reproductive rights') || e.type.includes('abortion accompaniment'))) byCategory.health.push(e);
}

const groupedPath = join(ROOT, 'scripts/directory-by-category.json');
writeFileSync(groupedPath, JSON.stringify(byCategory, null, 2) + '\n', 'utf8');

console.log('Merged directory:', mergedList.length, 'entries');
console.log('By category: psychologists', byCategory.psychologists.length, '| lawyers', byCategory.lawyers.length, '| organizations', byCategory.organizations.length, '| health', byCategory.health.length);
console.log('Written to', DIR_DATA);
console.log('Grouped by category written to', groupedPath);
