/** Shared number/date formatting so tooltips, tables and labels always agree. */

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const fmtNumber = (v, digits = 0) =>
  v === null || v === undefined || Number.isNaN(v)
    ? '–'
    : Number(v).toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });

export const fmtCompact = (v) =>
  v === null || v === undefined ? '–' : compact.format(Number(v));

export const fmtMoney = (v, digits = 0) =>
  v === null || v === undefined ? '–' : `$${fmtNumber(v, digits)}`;

export const fmtPercent = (v, digits = 1) =>
  v === null || v === undefined ? '–' : `${fmtNumber(v, digits)}%`;

export const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

/** Picks the right formatter from a short name used in chart props. */
export const FORMATTERS = {
  number: fmtNumber,
  compact: fmtCompact,
  money: fmtMoney,
  percent: fmtPercent,
};

export function getFormatter(name) {
  return FORMATTERS[name] || fmtNumber;
}
