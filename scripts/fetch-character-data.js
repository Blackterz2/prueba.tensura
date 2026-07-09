#!/usr/bin/env node

/**
 * @fileoverview Script Node para enriquecer characters.json con imágenes y
 * descripciones desde las APIs de AniList y Jikan.
 *
 * Uso: node scripts/fetch-character-data.js
 *
 * Estrategia:
 *  1. Lee characters.json
 *  2. Busca cada personaje vía Character(search) global de AniList
 *  3. Descarga image.large a assets/images/characters/{slug}.jpg
 *  4. Obtiene descripción desde AniList o Jikan como fallback
 *  5. Actualiza characters.json
 *
 * Requisitos: Node 18+ (fetch nativo). No requiere API keys.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DATA_FILE = path.join(ROOT, 'assets', 'data', 'characters.json');
const IMAGES_DIR = path.join(ROOT, 'assets', 'images', 'characters');
const ANILIST_API = 'https://graphql.anilist.co';
const JIKAN_API = 'https://api.jikan.moe/v4';

const DELAY_MS = 800;
const TIMEOUT_MS = 12_000;

if (!existsSync(IMAGES_DIR)) {
  mkdirSync(IMAGES_DIR, { recursive: true });
}

// ── Helpers ──

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, opts = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function downloadFile(url, destPath) {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buffer);
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function summarize(text, maxLen = 300) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastPeriod = cut.lastIndexOf('.');
  if (lastPeriod > 100) return cut.slice(0, lastPeriod + 1);
  return cut + '…';
}

function imageFilename(name, form) {
  return `${slugify(name)}-${slugify(form).slice(0, 30)}.jpg`;
}

// ── AniList: buscar personaje por nombre global ──

async function searchAnilistCharacter(name) {
  const query = `query ($n: String) {
    Character(search: $n) {
      id
      name { full }
      image { large }
      description
    }
  }`;

  const res = await fetchWithTimeout(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables: { n: name } }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      console.log('     ⏳ Rate limited, esperando 5s...');
      await sleep(5000);
      const retryRes = await fetchWithTimeout(ANILIST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables: { n: name } }),
      });
      if (!retryRes.ok) return null;
      const retryData = await retryRes.json();
      return retryData?.data?.Character || null;
    }
    return null;
  }

  const data = await res.json();
  const char = data?.data?.Character;
  if (!char || !char.image?.large) return null;

  return {
    image: char.image.large,
    description: char.description ? summarize(stripHtml(char.description)) : '',
  };
}

// ── Jikan: sinopsis de anime por temporada (fallback descripción) ──

const SEASON_SEARCH = {
  'Temporada 1': 'Tensei Shitara Slime Datta Ken',
  'Temporada 2 Parte 1': 'Tensei Shitara Slime Datta Ken 2nd Season',
  'Temporada 2 Parte 2': 'Tensei Shitara Slime Datta Ken 2nd Season Part 2',
  'Temporada 3': 'Tensei Shitara Slime Datta Ken 3rd Season',
  'Película: Scarlet Bond': 'Tensei Shitara Slime Datta Ken Scarlet Bond',
};

async function searchJikanAnimeSynopsis(seasonLabel) {
  const searchTerm = SEASON_SEARCH[seasonLabel];
  if (!searchTerm) return null;

  await sleep(400); // Jikan tiene rate limiting más estricto

  try {
    const res = await fetchWithTimeout(
      `${JIKAN_API}/anime?q=${encodeURIComponent(searchTerm)}&limit=1&order_by=start_date&sort=desc`
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.data?.[0]?.synopsis) {
      return summarize(stripHtml(json.data[0].synopsis));
    }
  } catch {
    return null;
  }
  return null;
}

// ── Main ──

async function main() {
  console.log('📖 Leyendo characters.json...');
  const raw = readFileSync(DATA_FILE, 'utf-8');
  const characters = JSON.parse(raw);

  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const label = `[${i + 1}/${characters.length}] ${char.name} — ${char.form}`;

    if (char.image) {
      console.log(`  ⏭  ${label} — ya tiene imagen`);
      continue;
    }

    console.log(`  🔍 Buscando ${label}...`);
    await sleep(DELAY_MS);

    // Mapa de alias para nombres que AniList no matchea con el nombre en español/inglés
    const nameAliases = {
      'Carrion': 'Karion',
      'Adalmann': 'Adalman',
    };
    const searchName = nameAliases[char.name] || char.name;

    try {
      const result = await searchAnilistCharacter(searchName);

      if (!result?.image) {
        notFound++;
        console.log(`  ⚠️   No encontrado en AniList: ${label}`);
        continue;
      }

      // Descargar imagen
      const slug = imageFilename(char.name, char.form);
      const destPath = path.join(IMAGES_DIR, slug);

      try {
        console.log(`     📥 Descargando: ${slug}`);
        await downloadFile(result.image, destPath);
        char.image = `assets/images/characters/${slug}`;
        console.log(`     ✅ Imagen guardada (${result.image.slice(0, 60)}...)`);
      } catch (dlErr) {
        console.log(`     ❌ Error descargando imagen: ${dlErr.message}`);
        // No rompemos, dejamos image como null
      }

      // Descripción
      if (!char.description) {
        if (result.description) {
          char.description = result.description;
          console.log(`     📝 Descripción desde AniList`);
        } else {
          await sleep(DELAY_MS);
          const synopsis = await searchJikanAnimeSynopsis(char.season);
          if (synopsis) {
            char.description = synopsis;
            console.log(`     📝 Descripción desde Jikan (${char.season})`);
          }
        }
      }

      updated++;
    } catch (err) {
      console.log(`     ❌ Error procesando ${label}: ${err.message}`);
    }
  }

  writeFileSync(DATA_FILE, JSON.stringify(characters, null, 2), 'utf-8');
  console.log(`\n✅ Completado. Actualizados: ${updated} | No encontrados: ${notFound}`);
  console.log(`   Los que fallaron quedan con image: null y usan SVG fallback en el frontend.`);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
