/**
 * @fileoverview SVG icons originales por arquetipo de personaje.
 * Ilustraciones vectoriales propias (no arte oficial), pensadas como
 * siluetas representativas. Sin dependencias.
 */

/** @type {Record<string, string>} Cuerpo SVG (path) por arquetipo */
export const ICONS = {
  slime:
    `<path d="M20 6c8 0 14 6 14 14s-6 14-14 14S6 28 6 20 12 6 20 6z" fill="currentColor"/><circle cx="15" cy="18" r="2" fill="#0a0d18"/><circle cx="25" cy="18" r="2" fill="#0a0d18"/><path d="M15 24q5 4 10 0" stroke="#0a0d18" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,

  slimeGod:
    `<path d="M20 8c8 0 13 6 13 13s-5 13-13 13S7 28 7 21s5-13 13-13z" fill="currentColor"/><circle cx="15.5" cy="19" r="1.8" fill="#0a0d18"/><circle cx="24.5" cy="19" r="1.8" fill="#0a0d18"/><path d="M16 25q4 3 8 0" stroke="#0a0d18" stroke-width="1.4" fill="none" stroke-linecap="round"/><polygon points="20,0 22.5,5 20,10 17.5,5" fill="currentColor"/>`,

  dragon:
    `<path d="M5 23c2-9 9-15 17-15 5 0 9 2 11 6-3-1-6 0-7 2 3 1 5 4 4 7-2-2-5-2-7 0-2 3-5 5-9 5-6 0-8-2-9-5z" fill="currentColor"/><circle cx="13" cy="17" r="1.5" fill="#0a0d18"/>`,

  demonLord:
    `<path d="M6 30l3-15 6 8 5-11 5 11 6-8 3 15z" fill="currentColor"/><rect x="6" y="30" width="28" height="4" rx="1" fill="currentColor"/><circle cx="20" cy="9" r="2" fill="currentColor"/>`,

  demonBlack:
    `<path d="M20 8c-2 4-2 8 0 12-2-1-8-2-12 2 2-5 1-9-5-13 6 0 10-2 12-6 1 2 3 4 5 5zM20 8c2 4 2 8 0 12 2-1 8-2 12 2-2-5-1-9 5-13-6 0-10-2-12-6-1 2-3 4-5 5z" fill="currentColor"/><circle cx="17" cy="17" r="1.4" fill="#0a0d18"/><circle cx="23" cy="17" r="1.4" fill="#0a0d18"/>`,

  oni:
    `<path d="M8 10l6 5M32 10l-6 5" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="9" y="15" width="22" height="17" rx="7" fill="currentColor"/><circle cx="16" cy="22" r="1.6" fill="#0a0d18"/><circle cx="24" cy="22" r="1.6" fill="#0a0d18"/><path d="M15 27l2 4M25 27l-2 4" stroke="#0a0d18" stroke-width="2" stroke-linecap="round"/>`,

  oniFire:
    `<path d="M8 12l6 5M32 12l-6 5" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="9" y="17" width="22" height="16" rx="7" fill="currentColor"/><circle cx="16" cy="24" r="1.6" fill="#0a0d18"/><circle cx="24" cy="24" r="1.6" fill="#0a0d18"/><path d="M20 2c2 3 3 5 1 8-1 1-2 0-2-1-.3 1.3-2 1.6-2.7.3-1.3-2.4 1-5.6 3.7-7.3z" fill="currentColor"/>`,

  blade:
    `<path d="M20 3l3 21-3 3-3-3z" fill="currentColor"/><rect x="13" y="27" width="14" height="3" rx="1" fill="currentColor"/><rect x="18" y="30" width="4" height="8" rx="1.5" fill="currentColor"/>`,

  goblin:
    `<path d="M6 15l6 3M34 15l-6 3" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="23" r="11" fill="currentColor"/><circle cx="16" cy="21" r="1.5" fill="#0a0d18"/><circle cx="24" cy="21" r="1.5" fill="#0a0d18"/><path d="M16 27q4 3 8 0" stroke="#0a0d18" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,

  wolf:
    `<path d="M9 11l4 8H6zM31 11l-4 8h7z" fill="currentColor"/><path d="M6 21c0-7 6-11 14-11s14 4 14 11c0 6-6 11-9 11l-2 4-2-4c-3 0-15-5-15-11z" fill="currentColor"/><circle cx="15" cy="19" r="1.5" fill="#0a0d18"/><circle cx="25" cy="19" r="1.5" fill="#0a0d18"/>`,

  witch:
    `<path d="M20 3l11 21H9z" fill="currentColor"/><ellipse cx="20" cy="27" rx="15" ry="3.4" fill="currentColor"/><circle cx="20" cy="14" r="2" fill="#0a0d18"/>`,

  fist:
    `<rect x="9" y="17" width="22" height="15" rx="5" fill="currentColor"/><rect x="13" y="10" width="4" height="11" rx="2" fill="currentColor"/><rect x="19" y="7" width="4" height="14" rx="2" fill="currentColor"/><rect x="25" y="10" width="4" height="11" rx="2" fill="currentColor"/>`,

  beastKing:
    `<circle cx="20" cy="21" r="15" fill="currentColor" opacity=".45"/><circle cx="20" cy="21" r="8.5" fill="currentColor"/><circle cx="17" cy="19" r="1.3" fill="#0a0d18"/><circle cx="23" cy="19" r="1.3" fill="#0a0d18"/>`,

  fairy:
    `<ellipse cx="12" cy="19" rx="7" ry="10.5" fill="currentColor" opacity=".7"/><ellipse cx="28" cy="19" rx="7" ry="10.5" fill="currentColor" opacity=".7"/><circle cx="20" cy="21" r="4.2" fill="currentColor"/>`,

  brain:
    `<circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" stroke-width="3"/><path d="M13.5 20a6.5 6.5 0 0113 0 6.5 6.5 0 01-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,

  chaos:
    `<path d="M20 4a16 16 0 1010 28" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><circle cx="20" cy="20" r="4.2" fill="currentColor"/>`,

  ghost:
    `<path d="M9 31V18a11 11 0 0122 0v13l-3.2-3.2-3.2 3.2-3.2-3.2-3.2 3.2-3.2-3.2z" fill="currentColor"/><circle cx="16" cy="18" r="1.5" fill="#0a0d18"/><circle cx="24" cy="18" r="1.5" fill="#0a0d18"/>`,

  hammer:
    `<g transform="rotate(-32 20 20)"><rect x="9" y="10" width="13" height="8" rx="1.5" fill="currentColor"/><rect x="13.5" y="18" width="4" height="16" fill="currentColor"/></g>`,

  human:
    `<circle cx="20" cy="14" r="7" fill="currentColor"/><path d="M8 33c1-8 6-12 12-12s11 4 12 12z" fill="currentColor"/>`,
};

/**
 * Genera el markup de un SVG icon para un arquetipo dado.
 * @param {string} archetype - Clave en ICONS
 * @param {string} [sizeClass='w-6 h-6 sm:w-7 sm:h-7'] - Clases de tamaño Tailwind
 * @returns {string} HTML string del SVG
 */
export function iconMarkup(archetype, sizeClass = 'w-6 h-6 sm:w-7 sm:h-7') {
  const body = ICONS[archetype] || ICONS.human;
  return `<svg viewBox="0 0 40 40" class="${sizeClass}" style="color:#0a0d18cc">${body}</svg>`;
}
