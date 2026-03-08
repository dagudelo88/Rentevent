/**
 * Shared inventory constants used across the app and the public catalog.
 */

export const CATEGORIES = [
  'Mobiliario',
  'Lounge & Salas',
  'Mantelería',
  'Menaje',
  'Decoración',
  'Estructuras',
  'Iluminación',
];

/** Visual style per category used in the public catalog when no image is available. */
export const CATEGORY_STYLES = {
  'Mobiliario':      { gradient: 'from-amber-100 to-amber-200',  emoji: '🪑' },
  'Lounge & Salas':  { gradient: 'from-purple-100 to-purple-200', emoji: '🛋️' },
  'Mantelería':      { gradient: 'from-pink-100 to-pink-200',     emoji: '🎀' },
  'Menaje':          { gradient: 'from-sky-100 to-sky-200',       emoji: '🍽️' },
  'Decoración':      { gradient: 'from-rose-100 to-rose-200',     emoji: '✨' },
  'Estructuras':     { gradient: 'from-slate-100 to-slate-200',   emoji: '🏗️' },
  'Iluminación':     { gradient: 'from-yellow-100 to-yellow-200', emoji: '💡' },
};

export const DEFAULT_CATEGORY_STYLE = { gradient: 'from-indigo-100 to-indigo-200', emoji: '📦' };
