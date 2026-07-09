/**
 * @fileoverview Constantes de configuración global: tiers, umbrales y utilidades
 * de escala. No depende de ningún otro módulo.
 */

/**
 * Escala de niveles de amenaza (tiers), ordenados de mayor a menor poder.
 * @typedef {{ min: number, label: string, grad: string, text: string, ring: string }} Tier
 */
export const TIERS = [
  { min: 50_000_000, label: 'Clase Divina',                       grad: 'from-yellow-300 via-amber-400 to-yellow-500',  text: 'text-yellow-300', ring: 'glow-god' },
  { min: 10_000_000, label: 'Desastre (Verdadero Demon Lord)',    grad: 'from-fuchsia-400 via-purple-500 to-purple-700', text: 'text-fuchsia-300', ring: '' },
  { min: 1_000_000,  label: 'Catástrofe (Demon Lord)',            grad: 'from-purple-500 to-indigo-600',                 text: 'text-purple-300', ring: '' },
  { min: 100_000,    label: 'Special A (Kijin)',                  grad: 'from-sky-400 to-blue-600',                      text: 'text-sky-300',    ring: '' },
  { min: 10_000,     label: 'Amenaza A',                          grad: 'from-cyan-400 to-teal-500',                     text: 'text-cyan-300',   ring: '' },
  { min: 1_000,      label: 'Amenaza B',                          grad: 'from-teal-400 to-emerald-500',                  text: 'text-teal-300',   ring: '' },
  { min: 100,        label: 'Amenaza C',                          grad: 'from-emerald-400 to-green-500',                 text: 'text-emerald-300', ring: '' },
  { min: 0,          label: 'Amenaza D',                          grad: 'from-slate-400 to-slate-500',                   text: 'text-slate-300',  ring: '' },
];

/**
 * Retorna el tier correspondiente a un valor de poder.
 * @param {number} power
 * @returns {Tier}
 */
export function getTier(power) {
  return TIERS.find(t => power >= t.min);
}

/**
 * Convierte un valor de poder a porcentaje usando escala logarítmica.
 * El rango real (50 - 100M) es demasiado amplio para escala lineal.
 * @param {number} power
 * @param {number} maxPower - El poder máximo del dataset (se pasa desde data.js)
 * @returns {number} Porcentaje entre 4 y 100
 */
export function powerToPercent(power, maxPower) {
  const logMax = Math.log10(maxPower + 1);
  const logVal = Math.log10(power + 1);
  return Math.max(4, (logVal / logMax) * 100);
}
