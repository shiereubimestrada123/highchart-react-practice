/**
 * Design tokens for every chart in the app.
 *
 * The categorical order is fixed on purpose: slot 1 is always blue, slot 2 is
 * always orange, and so on. Never shuffle or cycle these — a series keeps its
 * colour when a filter removes its neighbours, which is what lets people
 * compare two screenshots of the same dashboard.
 *
 * The dark column is not an automatic flip of the light column; it is the same
 * eight hues re-stepped so they stay readable on a dark surface.
 */

export const CATEGORICAL = {
  light: [
    '#2a78d6', // 1 blue
    '#eb6834', // 2 orange
    '#1baf7a', // 3 aqua
    '#eda100', // 4 yellow
    '#e87ba4', // 5 magenta
    '#008300', // 6 green
    '#4a3aa7', // 7 violet
    '#e34948', // 8 red
  ],
  dark: [
    '#3987e5',
    '#d95926',
    '#199e70',
    '#c98500',
    '#d55181',
    '#008300',
    '#9085e9',
    '#e66767',
  ],
};

/** Single-hue ramp for magnitude (heatmaps, treemaps, choropleths). */
export const SEQUENTIAL_BLUE = [
  '#cde2fb',
  '#b7d3f6',
  '#9ec5f4',
  '#86b6ef',
  '#6da7ec',
  '#5598e7',
  '#3987e5',
  '#2a78d6',
  '#256abf',
  '#1c5cab',
  '#184f95',
  '#104281',
  '#0d366b',
];

/** Two poles + a neutral middle. Never put a hue at the midpoint. */
export const DIVERGING = {
  low: '#2a78d6',
  mid: { light: '#f0efec', dark: '#383835' },
  high: '#e34948',
};

/** Reserved meanings. These never double as "series 4". */
export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

/** Chart chrome: surfaces, ink and hairlines. */
export const CHROME = {
  light: {
    surface: '#fcfcfb',
    plane: '#f9f9f7',
    textPrimary: '#0b0b0b',
    textSecondary: '#52514e',
    textMuted: '#898781',
    gridline: '#e1e0d9',
    baseline: '#c3c2b7',
    border: 'rgba(11,11,11,0.10)',
    positive: '#006300',
    negative: '#d03b3b',
    tooltipBg: 'rgba(252,252,251,0.98)',
  },
  dark: {
    surface: '#1a1a19',
    plane: '#0d0d0d',
    textPrimary: '#ffffff',
    textSecondary: '#c3c2b7',
    textMuted: '#898781',
    gridline: '#2c2c2a',
    baseline: '#383835',
    border: 'rgba(255,255,255,0.10)',
    positive: '#0ca30c',
    negative: '#e66767',
    tooltipBg: 'rgba(26,26,25,0.98)',
  },
};

export const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * Pick n categorical colours in slot order.
 * Past eight series, fold the tail into "Other" instead of inventing hues.
 */
export function seriesColors(mode = 'light', count) {
  const all = CATEGORICAL[mode] || CATEGORICAL.light;
  return typeof count === 'number' ? all.slice(0, count) : all;
}
