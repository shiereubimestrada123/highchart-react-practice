/**
 * Highcharts options are deeply nested, so every layer of config in this app
 * (theme → type preset → props → raw escape hatch) is combined with a deep
 * merge instead of a spread. A spread at the top level would silently drop
 * `plotOptions.series.dataLabels` the moment two layers both set `plotOptions`.
 *
 * Rules:
 *  - plain objects merge recursively
 *  - arrays replace wholesale (a later `series` array is the whole series list,
 *    not an element-wise merge — element-wise would be surprising)
 *  - `undefined` on the right never clobbers a value on the left
 *  - `null` on the right *does* clobber, which is how you unset something
 */
export function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export function deepMerge(target, source) {
  if (!isPlainObject(source)) return source === undefined ? target : source;
  if (!isPlainObject(target)) return deepMerge({}, source);

  const out = { ...target };
  for (const key of Object.keys(source)) {
    const next = source[key];
    if (next === undefined) continue;
    out[key] = isPlainObject(next) ? deepMerge(out[key], next) : next;
  }
  return out;
}

/** Left-to-right merge; later layers win. Falsy layers are skipped. */
export function mergeAll(...layers) {
  return layers.reduce((acc, layer) => (layer ? deepMerge(acc, layer) : acc), {});
}
