# Escala de Poder · Tensura

Una **escala interactiva de Puntos de Existencia (EP)** de los personajes de *Tensei Shitara Slime Datta Ken* (Tensura). Ranking visual con filtros, búsqueda y duelo comparativo. Hecho con vanilla JS + Tailwind CDN, sin frameworks ni bundlers.

## Cómo correrlo

```bash
# Opción 1: servidor estático con Node
npx serve .

# Opción 2: Live Server (VS Code)
# Botón derecho en index.html → Open with Live Server

# Opción 3: Python
python -m http.server 8000
```

Abrís `http://localhost:3000` (o el puerto que corresponda).

> **⚠ Importante:** El proyecto carga `assets/data/characters.json` via `fetch`, así que **no funciona con `file://` — necesitás un servidor HTTP.**

## Estructura

```
├── index.html                  # HTML principal (carga módulos como ESM)
├── src/
│   ├── css/styles.css          # Estilos personalizados (tema oscuro, animaciones)
│   └── js/
│       ├── config.js           # TIERS, utilidades de escala
│       ├── data.js             # Carga y ordena characters.json
│       ├── icons.js            # SVGs originales por arquetipo
│       ├── render.js           # Renderiza listas, duelos, filtros
│       └── main.js             # Estado global, listeners, init
├── assets/
│   ├── data/characters.json    # Datos de personajes (fuente única)
│   └── images/characters/      # Imágenes descargadas (gitignored)
└── scripts/
    └── fetch-character-data.js # Script para poblar imágenes y descripciones
```

## De dónde salen los datos

- **Valores de poder:** Estimaciones narrativas basadas en la obra de Fuse (no son EP oficiales del anime/manga, sino una aproximación para representar la brecha de poder entre formas).
- **Imágenes:** Se descargan de [AniList](https://anilist.co) (API GraphQL pública) mediante el script `scripts/fetch-character-data.js`.
- **Descripciones:** Desde AniList (descripción del personaje) o [Jikan](https://docs.api.jikan.moe) (sinopsis por temporada) como fallback.

### Poblar imágenes y descripciones

```bash
node scripts/fetch-character-data.js
```

Requiere Node 18+ (fetch nativo). El script:
1. Busca cada personaje en AniList dentro del anime Tensura
2. Descarga la imagen a `assets/images/characters/`
3. Obtiene descripción (AniList → Jikan → vacío si no hay match)
4. Actualiza `characters.json` con las rutas y descripciones

Los personajes/evoluciones de novela que no tengan arte dedicado quedan con `image: null` y muestran el avatar SVG como fallback.

## Features

- ✅ Ranking por poder descendente con barras de escala logarítmica
- ✅ Búsqueda por nombre o forma
- ✅ Filtro por temporada/arco
- ✅ Sistema de tiers (Amenaza D → Clase Divina)
- ✅ Duelo comparativo (seleccioná dos personajes)
- ✅ Imágenes reales con fallback a SVGs originales
- ✅ Descripciones expandibles por personaje
- ✅ Diseño oscuro responsive con partículas animadas
- ✅ 0 dependencias (solo CDN de Tailwind y Google Fonts)
