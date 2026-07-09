/**
 * @fileoverview Funciones de renderizado del DOM. Toman el estado global
 * de main.js y producen HTML para la lista, el panel de duelo y los filtros.
 */

import { getTier } from './config.js';
import { DATA, getCharacterById, powerBarPercent, SEASONS } from './data.js';
import { iconMarkup } from './icons.js';
import { state } from './main.js';

/* ── Referencias DOM (se resuelven una vez al importar) ── */

const listEl = document.getElementById('characterList');
const emptyStateEl = document.getElementById('emptyState');
const resultCountEl = document.getElementById('resultCount');
const totalCountEl = document.getElementById('totalCount');
const seasonFiltersEl = document.getElementById('seasonFilters');
const duelPanel = document.getElementById('duelPanel');
const duelContent = document.getElementById('duelContent');

/* ── Filtros de temporada ── */

/** Renderiza los botones de filtro por temporada. */
export function renderSeasonFilters() {
  const { season } = state;
  seasonFiltersEl.innerHTML = SEASONS.map(s => `
    <button data-season="${s}"
      class="chip px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 ${s === season ? 'active' : ''}">
      ${s}
    </button>
  `).join('');

  seasonFiltersEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.season = btn.dataset.season;
      renderSeasonFilters();
      renderList();
    });
  });
}

/* ── Lista de personajes ── */

/** Filtra DATA según estado actual (búsqueda + temporada). @returns {Character[]} */
function getFilteredData() {
  const q = state.search.trim().toLowerCase();
  return DATA.filter(c => {
    const matchesSeason = state.season === 'Todas' || c.season === state.season;
    const matchesSearch = !q
      || c.name.toLowerCase().includes(q)
      || c.form.toLowerCase().includes(q);
    return matchesSeason && matchesSearch;
  });
}

/** Renderiza el listado de personajes filtrado. */
export function renderList() {
  const data = getFilteredData();
  resultCountEl.textContent = `Mostrando ${data.length} registro${data.length === 1 ? '' : 's'}`;

  if (data.length === 0) {
    listEl.innerHTML = '';
    emptyStateEl.classList.remove('hidden');
    return;
  }
  emptyStateEl.classList.add('hidden');

  listEl.innerHTML = data.map((c, idx) => {
    const tier = getTier(c.power);
    const pct = powerBarPercent(c.power);
    const selected = state.selected.has(c.id);
    const disabledCheckbox = (!selected && state.selected.size >= 2);

    const avatarHtml = c.image
      ? `<img src="${c.image}" alt="${c.name}" class="avatar-img" loading="lazy">`
      : iconMarkup(c.archetype);

    return `
    <div class="card ${selected ? 'selected' : ''} rounded-xl p-4 sm:p-5 flex items-center gap-4" data-id="${c.id}">
      <!-- rank -->
      <div class="w-9 shrink-0 text-center font-mono text-xs text-slate-500">#${idx + 1}</div>

      <!-- checkbox -->
      <label class="shrink-0 cursor-pointer">
        <input type="checkbox" data-id="${c.id}" ${selected ? 'checked' : ''} ${disabledCheckbox ? 'disabled' : ''}
          class="w-5 h-5 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
      </label>

      <!-- avatar (imagen real o SVG fallback) -->
      <div class="avatar w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${tier.grad} ${tier.ring}">
        ${avatarHtml}
      </div>

      <!-- info -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
          <h3 class="font-display font-700 text-base sm:text-lg text-slate-100 truncate">${c.name}</h3>
          <span class="text-xs sm:text-sm text-slate-400 italic truncate">— ${c.form}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span class="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full border border-[#2a2f52] text-slate-400">${c.season}</span>
          <span class="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-[#0f1424] ${tier.text} border border-[#2a2f52]">${tier.label}</span>
        </div>
        <!-- descripción expandible -->
        ${c.description ? `
        <div class="mt-1">
          <span class="desc-toggle" data-desc-id="${c.id}">📖 +info</span>
          <div class="desc-body text-xs text-slate-400 leading-relaxed pl-1" data-desc-body="${c.id}">
            ${c.description}
          </div>
        </div>` : ''}
        <!-- power bar -->
        <div class="power-track w-full h-2.5 rounded-full overflow-hidden ${tier.ring} mt-2">
          <div class="power-fill h-full rounded-full bg-gradient-to-r ${tier.grad}" style="width:${pct}%"></div>
        </div>
      </div>

      <!-- power number -->
      <div class="shrink-0 text-right">
        <div class="font-mono font-700 text-sm sm:text-base ${tier.text}">${c.power.toLocaleString('es-ES')}</div>
        <div class="text-[10px] text-slate-500 font-mono">PTS. EXIST.</div>
      </div>
    </div>`;
  }).join('');

  // listeners: checkboxes
  listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = Number(cb.dataset.id);
      if (cb.checked) state.selected.add(id);
      else state.selected.delete(id);
      renderList();
      renderDuel();
    });
  });

  // listeners: description accordion
  listEl.querySelectorAll('.desc-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.descId;
      const body = document.querySelector(`[data-desc-body="${id}"]`);
      if (body) {
        body.classList.toggle('open');
        e.currentTarget.textContent = body.classList.contains('open') ? '📖 -info' : '📖 +info';
      }
    });
  });
}

/* ── Duelo comparativo ── */

/** Texto narrativo según el % de diferencia. @param {number} ratioPercent */
function flavorText(ratioPercent) {
  if (ratioPercent >= 100_000) return 'Esto no es una pelea, es un evento cósmico. 🌌';
  if (ratioPercent >= 10_000)  return 'La diferencia es abismal, casi cómica. 💀';
  if (ratioPercent >= 1_000)   return 'Ni con un ejército de refuerzos hay contienda. ⚡';
  if (ratioPercent >= 100)     return 'Ventaja aplastante, el resultado ya está decidido. 🔥';
  if (ratioPercent >= 20)      return 'Superioridad clara, pero no imposible de remontar. 🗡';
  return '¡Un enfrentamiento sorprendentemente parejo! ⚔';
}

/** Renderiza el panel de duelo cuando hay exactamente 2 seleccionados. */
export function renderDuel() {
  const ids = [...state.selected];
  if (ids.length !== 2) {
    duelPanel.classList.add('translate-y-full');
    return;
  }
  duelPanel.classList.remove('translate-y-full');

  const chars = ids.map(id => getCharacterById(id));
  const [strong, weak] = chars[0].power >= chars[1].power ? chars : [chars[1], chars[0]];
  const tierStrong = getTier(strong.power);
  const tierWeak = getTier(weak.power);

  const ratio = (strong.power / weak.power - 1) * 100;
  const ratioDisplay = ratio > 999_999 ? '>999,999' : Math.round(ratio).toLocaleString('es-ES');
  const barWeakPct = Math.max(2, (weak.power / strong.power) * 100);

  const strongAvatar = strong.image
    ? `<img src="${strong.image}" alt="${strong.name}" class="avatar-img">`
    : iconMarkup(strong.archetype, 'w-9 h-9');

  const weakAvatar = weak.image
    ? `<img src="${weak.image}" alt="${weak.name}" class="avatar-img">`
    : iconMarkup(weak.archetype, 'w-9 h-9');

  duelContent.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-center mb-5">
      <!-- strong -->
      <div class="flex flex-col sm:flex-row-reverse items-center gap-3 justify-center sm:justify-start">
        <div class="avatar avatar-lg w-16 h-16 bg-gradient-to-br ${tierStrong.grad} ${tierStrong.ring}">
          ${strongAvatar}
        </div>
        <div class="text-center sm:text-right">
          <p class="font-display text-lg text-slate-100">${strong.name}</p>
          <p class="text-xs text-slate-400 italic mb-1">${strong.form}</p>
          <p class="font-mono ${tierStrong.text} font-700">${strong.power.toLocaleString('es-ES')}</p>
          ${strong.description ? `<p class="text-[10px] text-slate-500 mt-1 max-w-[180px]">${strong.description}</p>` : ''}
        </div>
      </div>
      <div class="font-display text-2xl text-amber-300 text-center">VS</div>
      <!-- weak -->
      <div class="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
        <div class="avatar avatar-lg w-16 h-16 bg-gradient-to-br ${tierWeak.grad} ${tierWeak.ring}">
          ${weakAvatar}
        </div>
        <div class="text-center sm:text-left">
          <p class="font-display text-lg text-slate-100">${weak.name}</p>
          <p class="text-xs text-slate-400 italic mb-1">${weak.form}</p>
          <p class="font-mono ${tierWeak.text} font-700">${weak.power.toLocaleString('es-ES')}</p>
          ${weak.description ? `<p class="text-[10px] text-slate-500 mt-1 max-w-[180px]">${weak.description}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- comparative bars -->
    <div class="space-y-2 mb-5 max-w-2xl mx-auto">
      <div class="flex items-center gap-3">
        <span class="w-24 sm:w-32 text-xs text-right text-slate-400 truncate">${strong.name}</span>
        <div class="flex-1 h-4 rounded-full power-track overflow-hidden">
          <div class="duel-bar h-full rounded-full bg-gradient-to-r ${tierStrong.grad}" style="width:100%"></div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="w-24 sm:w-32 text-xs text-right text-slate-400 truncate">${weak.name}</span>
        <div class="flex-1 h-4 rounded-full power-track overflow-hidden">
          <div class="duel-bar h-full rounded-full bg-gradient-to-r ${tierWeak.grad}" style="width:${barWeakPct}%"></div>
        </div>
      </div>
    </div>

    <div class="text-center">
      <p class="text-base sm:text-lg text-slate-200">
        <span class="font-display ${tierStrong.text}">${strong.name}</span> es
        <span class="font-mono font-900 text-amber-300 text-xl">${ratioDisplay}%</span>
        más fuerte que <span class="font-display ${tierWeak.text}">${weak.name}</span>
      </p>
      <p class="text-sm text-slate-500 mt-1">${flavorText(ratio)}</p>
    </div>`;
}
