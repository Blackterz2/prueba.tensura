/**
 * @fileoverview Carga y gestiona los datos de personajes desde characters.json.
 * Exporta la data ordenada y utilidades de consulta.
 */

import { getTier, powerToPercent } from './config.js';

/** @type {Character[]} Array global de personajes ordenado por poder descendente */
export let DATA = [];

/** @type {string[]} Lista de temporadas únicas */
export let SEASONS = [];

/** @type {number} Poder máximo del dataset */
export let MAX_POWER = 0;

/**
 * Carga characters.json, asigna IDs, ordena por poder descendente
 * y deriva temporadas.
 * @returns {Promise<Character[]>}
 */
export async function loadData() {
  const res = await fetch('assets/data/characters.json');
  if (!res.ok) throw new Error(`Failed to load characters.json: ${res.status}`);

  /** @type {RawCharacter[]} */
  const raw = await res.json();

  DATA = raw
    .map((c, i) => ({ ...c, id: i }))
    .sort((a, b) => b.power - a.power);

  MAX_POWER = Math.max(...DATA.map(c => c.power));
  SEASONS = ['Todas', ...new Set(DATA.map(c => c.season))];

  return DATA;
}

/**
 * Retorna el tier de un personaje.
 * Delegada a config.getTier() para mantener la lógica en un solo lugar.
 * @param {number} power
 * @returns {import('./config.js').Tier}
 */
export { getTier };

/**
 * Convierte poder a porcentaje logarítmico para barras visuales.
 * @param {number} power
 * @returns {number}
 */
export function powerBarPercent(power) {
  return powerToPercent(power, MAX_POWER);
}

/**
 * Busca un personaje por ID.
 * @param {number} id
 * @returns {Character|undefined}
 */
export function getCharacterById(id) {
  return DATA.find(c => c.id === id);
}
