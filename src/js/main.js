/**
 * @fileoverview Punto de entrada de la aplicación. Define el estado global,
 * configura event listeners e inicializa el renderizado.
 *
 * Concepto: "Escala de Puntos de Existencia" — ranking interactivo de poder
 * de personajes de Tensei Shitara Slime Datta Ken (Tensura).
 */

import { loadData, DATA, SEASONS } from './data.js';
import { renderSeasonFilters, renderList, renderDuel } from './render.js';

/* ======================================================================
   ESTADO GLOBAL
   ====================================================================== */

/**
 * Estado reactivo de la aplicación.
 * @type {{ search: string, season: string, selected: Set<number> }}
 */
export const state = {
  /** Texto de búsqueda */
  search: '',
  /** Filtro de temporada activo */
  season: 'Todas',
  /** Set de IDs de personajes seleccionados para duelo (máx 2) */
  selected: new Set(),
};

/* ======================================================================
   EVENT LISTENERS
   ====================================================================== */

/** Conecta los listeners de UI que no dependen del renderizado dinámico. */
function setupListeners() {
  // Búsqueda
  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderList();
  });

  // Cerrar panel de duelo
  document.getElementById('closeDuel').addEventListener('click', () => {
    state.selected.clear();
    renderList();
    renderDuel();
  });
}

/* ======================================================================
   INIT
   ====================================================================== */

/**
 * Inicializa la aplicación: carga datos, renderiza todo.
 */
async function init() {
  try {
    await loadData();
  } catch (err) {
    console.error('Error al cargar datos:', err);
    document.getElementById('characterList').innerHTML =
      '<p class="text-red-400 text-center py-8">Error al cargar datos. ¿Estás sirviendo el archivo characters.json?</p>';
    return;
  }

  document.getElementById('totalCount').textContent = DATA.length;

  renderSeasonFilters();
  renderList();
  renderDuel();
  setupListeners();
}

init();
