/**
 * @fileoverview Script Node para enriquecer characters.json con imágenes y
 * descripciones desde las APIs de AniList y Jikan.
 *
 * Uso: node scripts/fetch-character-data.js
 *
 * Lo que hace:
 *  1. Lee assets/data/characters.json
 *  2. Busca cada personaje en AniList (GraphQL) dentro del anime Tensura
 *  3. Descarga image.large a assets/images/characters/{slug}.jpg
 *  4. Obtiene descripción del personaje (AniList) o sinopsis del anime (Jikan)
 *  5. Actualiza characters.json con image y description
 *
 * Requisitos: Node 18+ (fetch nativo)
 * No requiere API keys.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createWriteStream } from 'node:fs';
import { get } from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DATA_FILE = path.join(ROOT, 'assets', 'data', 'characters.json');
const IMAGES_DIR = path.join(ROOT, 'assets', 'images', 'characters');
const ANILIST_API = 'https://graphql.anilist.co';
const JIKAN_API = 'https://api.jikan.moe/v4';

const DELAY_MS = 600; // entre requests para no saturar APIs
const TIMEOUT_MS = 10_000;

// ── Aseguramos que el directorio de imágenes existe ──
if (!existsSync(IMAGES_DIR)) {
  mkdirSync(IMAGES_DIR, { recursive: true });
}

// ── Ayudantes ──

/** Normaliza texto a slug para nombres de archivo */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Delay promisificado */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Fetch con timeout */
async function fetchWithTimeout(url, opts = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/** Descarga una URL a un archivo local */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} downloading ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.destroy();
      reject(err);
    });
  });
}

// ── APIs ──

/** Busca personaje en AniList dentro del anime Tensura */
async function searchAnilistCharacter(name) {
  const query = `
    query ($name: String, $mediaName: String) {
      Media(search: $mediaName, type: ANIME) {
        id
        title { romaji }
        characters(search: $name, sort: [SEARCH_MATCH, ROLE]) {
          edges {
            role
            node {
              id
              name { full }
              image { large }
              description
            }
          }
        }
      }
    }
  `;

  // Intentamos con varios nombres de media
  const mediaNames = [
    'Tensei Shitara Slime Datta Ken',
    'That Time I Got Reincarnated as a Slime',
    'Tensura',
  ];

  for (const mediaName of mediaNames) {
    try {
      const res = await fetchWithTimeout(ANILIST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables: { name, mediaName } }),
      });

      if (!res.ok) continue;

      const json = await res.json();
      const edges = json?.data?.Media?.characters?.edges;
      if (!edges || edges.length === 0) continue;

      // Buscamos coincidencia exacta primero, sino el primer MAIN
      const exact = edges.find(e =>
        e.node.name.full.toLowerCase() === name.toLowerCase()
      );
      const main = edges.find(e => e.role === 'MAIN');
      const match = exact || main || edges[0];

      return {
        image: match.node.image?.large || null,
        description: stripHtml(match.node.description || ''),
      };
    } catch {
      continue;
    }
  }
  return null;
}

/** Obtiene sinopsis de temporada desde Jikan (fallback para descripciones) */
async function searchJikanAnimeSynopsis(seasonLabel) {
  // Mapeamos temporadas a términos de búsqueda
  const seasonMap = {
    'Temporada 1': 'Tensei Shitara Slime Datta Ken',
    'Temporada 2 Parte 1': 'Tensei Shitara Slime Datta Ken 2nd Season',
    'Temporada 2 Parte 2': 'Tensei Shitara Slime Datta Ken 2nd Season Part 2',
    'Temporada 3': 'Tensei Shitara Slime Datta Ken 3rd Season',
    'Película: Scarlet Bond': 'Tensei Shitara Slime Datta Ken Scarlet Bond',
  };

  const searchTerm = seasonMap[seasonLabel];
  if (!searchTerm) return null;

  try {
    const res = await fetchWithTimeout(
      `${JIKAN_API}/anime?q=${encodeURIComponent(searchTerm)}&limit=1&order_by=start_date&sort=desc`
    );
    if (!res.ok) return null;

    const json = await res.json();
    return json?.data?.[0]?.synopsis || null;
  } catch {
    return null;
  }
}

/** Remueve tags HTML de un string */
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/** Acorta una descripción a 2-3 frases (~300 chars) */
function summarize(text, maxLen = 300) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastPeriod = cut.lastIndexOf('.');
  if (lastPeriod > 100) return cut.slice(0, lastPeriod + 1);
  return cut + '…';
}

/** Genera el filename de imagen para un personaje */
function imageFilename(name, form) {
  return `${slugify(name)}-${slugify(form).slice(0, 30)}.jpg`;
}

// ── Main ──

async function main() {
  console.log('📖 Leyendo characters.json...');
  const raw = readFileSync(DATA_FILE, 'utf-8');
  /** @type {Array<{name:string,form:string,season:string,power:number,archetype:string,image:string|null,description:string}>} */
  const characters = JSON.parse(raw);

  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const label = `[${i + 1}/${characters.length}] ${char.name} — ${char.form}`;

    // Ya tiene imagen? Saltamos
    if (char.image) {
      console.log(`  ⏭  ${label} — ya tiene imagen`);
      continue;
    }

    console.log(`  🔍 Buscando ${label}...`);
    await sleep(DELAY_MS);

    try {
      const result = await searchAnilistCharacter(char.name);

      if (!result || !result.image) {
        notFound++;
        console.log(`  ⚠️   No encontrado: ${label}`);
        continue;
      }

      // Descargar imagen
      const slug = imageFilename(char.name, char.form);
      const destPath = path.join(IMAGES_DIR, slug);

      try {
        console.log(`     📥 Descargando imagen: ${slug}`);
        await downloadFile(result.image, destPath);
        char.image = `assets/images/characters/${slug}`;
        console.log(`     ✅ Imagen guardada: ${slug}`);
      } catch (dlErr) {
        console.log(`     ❌ Error descargando imagen: ${dlErr.message}`);
        // Dejamos image como null, no rompemos el flujo
      }

      // Descripción: prioridad AniList → Jikan → vacío
      if (!char.description) {
        if (result.description) {
          char.description = summarize(result.description);
          console.log(`     📝 Descripción desde AniList`);
        } else {
          // Fallback: Jikan synopsis de la temporada
          try {
            await sleep(DELAY_MS);
            const synopsis = await searchJikanAnimeSynopsis(char.season);
            if (synopsis) {
              char.description = summarize(synopsis);
              console.log(`     📝 Descripción desde Jikan (${char.season})`);
            }
          } catch {
            // Sin descripción, se deja vacía
          }
        }
      }

      updated++;
    } catch (err) {
      console.log(`     ❌ Error procesando: ${err.message}`);
    }
  }

  // Guardar JSON actualizado
  writeFileSync(DATA_FILE, JSON.stringify(characters, null, 2), 'utf-8');
  console.log(`\n✅ Hecho. Actualizados: ${updated} | No encontrados: ${notFound}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
