import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import HighchartsReactModule from 'highcharts-react-official';
import Highcharts from '../highcharts/setup';
import { getPreset } from '../highcharts/presets';
import { useChartTheme } from '../theme/useTheme';
import { mergeAll } from '../utils/deepMerge';
import { getFormatter } from '../utils/format';
import { CATEGORICAL } from '../highcharts/palette';

/**
 * The one reusable chart component.
 *
 * Everything renders through here — twenty-odd chart kinds, the dashboard
 * tiles, the live-updating chart, the playground. The point of a single
 * component is that theming, accessibility, resize handling and tooltip
 * formatting get fixed once instead of twenty times.
 *
 * The layering, lowest priority first:
 *
 *   1. global defaults        (highcharts/setup.js)
 *   2. theme for the mode     (highcharts/theme.js)
 *   3. preset for the kind    (highcharts/presets.js)
 *   4. convenience props      (title, categories, yTitle, stacking, …)
 *   5. `options` escape hatch (raw Highcharts, always wins)
 *
 * Layer 5 matters: no wrapper can anticipate every Highcharts option, so a
 * reusable component that cannot be overridden is a component people will
 * eventually abandon. Anything you can express in Highcharts you can express
 * here, and the convenience props are only shorthand for the common 90%.
 */

/**
 * `highcharts-react-official` ships a UMD bundle, and how a bundler unwraps it
 * varies: some hand back the component, others hand back the whole module
 * namespace ({ HighchartsReact, default }). Rendering the namespace fails with
 * "Element type is invalid… but got: object", so normalise it here once.
 */
const HighchartsReact = HighchartsReactModule.default ?? HighchartsReactModule;

/** Turn loose input into a proper Highcharts series array. */
function normalizeSeries({ series, data, name, kind, preset, mode }) {
  const palette = CATEGORICAL[mode];

  let list;
  if (Array.isArray(series) && series.length) {
    list = series.map((s) => (Array.isArray(s) ? { data: s } : { ...s }));
  } else if (Array.isArray(data)) {
    list = [{ name: name || 'Series 1', data }];
  } else {
    list = [];
  }

  return list.map((s, i) => {
    const next = { ...s };
    // `combo` leaves the type to the caller; every other kind fills it in.
    if (!next.type && preset.seriesType) next.type = preset.seriesType;
    if (!next.name) next.name = `Series ${i + 1}`;

    // Colour follows the entity, not its position in the current filter. Pass
    // `colorIndex` (a stable slot per entity) and a series keeps its colour
    // even when the series above it is filtered away.
    if (!next.color && typeof next.colorIndex === 'number') {
      next.color = palette[next.colorIndex % palette.length];
    }
    // Highcharts also reads `colorIndex` for styled mode; drop it so it cannot
    // fight the explicit colour we just set.
    delete next.colorIndex;

    if (kind === 'sparkline') next.enableMouseTracking = next.enableMouseTracking ?? true;
    return next;
  });
}

/** A tooltip that formats every value the same way the axis and table do. */
function buildTooltip({ shared, format, digits, chrome, valueSuffix, percent }) {
  const fmt = getFormatter(format);
  return {
    shared,
    crosshairs: shared
      ? { width: 1, color: chrome.baseline, dashStyle: 'Dash' }
      : undefined,
    useHTML: true,
    formatter() {
      const points = this.points || [this.point || this];
      const header = this.points
        ? `<div style="color:${chrome.textSecondary};margin-bottom:6px">${
            this.point?.category ?? this.x ?? ''
          }</div>`
        : '';
      const rows = points
        .map((p) => {
          const label = p.series?.name ?? p.point?.name ?? '';
          // Percent stacking hides the absolute value, so show the share and
          // the raw number together rather than making people guess.
          const value = percent
            ? `${Math.round(p.percentage)}% · ${fmt(p.y, digits)}`
            : fmt(p.y, digits);
          return `<div style="display:flex;align-items:center;gap:8px;line-height:1.5">
            <span style="width:8px;height:8px;border-radius:2px;background:${p.color};flex:none"></span>
            <span style="color:${chrome.textSecondary}">${label}</span>
            <span style="margin-left:auto;font-variant-numeric:tabular-nums;color:${chrome.textPrimary};font-weight:600">${value}${valueSuffix || ''}</span>
          </div>`;
        })
        .join('');
      return `<div style="min-width:150px">${header}${rows}</div>`;
    },
  };
}

const Chart = forwardRef(function Chart(
  {
    kind = 'line',
    title,
    subtitle,
    series,
    data,
    name,
    categories,
    xTitle,
    yTitle,
    xType, // 'datetime' | 'category' | 'linear' | 'logarithmic'
    yMin,
    yMax,
    format = 'number', // number | compact | money | percent
    digits = 0,
    valueSuffix,
    stacking,
    inverted,
    polar,
    height = 320,
    legend, // true | false | Highcharts legend options
    sharedTooltip,
    dataLabels = false,
    exporting = true,
    animation = true,
    accessibilityDescription,
    onPointClick,
    onSeriesToggle,
    options: userOptions,
    className,
    constructorType = 'chart',
  },
  ref,
) {
  const { mode, theme, chrome } = useChartTheme();
  const containerRef = useRef(null);
  const chartComponentRef = useRef(null);

  const preset = getPreset(kind);

  // Expose the raw Highcharts chart to parents (live updates, exporting, …)
  // without handing them the whole React wrapper.
  useImperativeHandle(
    ref,
    () => ({
      get chart() {
        return chartComponentRef.current?.chart ?? null;
      },
      reflow: () => chartComponentRef.current?.chart?.reflow(),
      exportPNG: () =>
        chartComponentRef.current?.chart?.exportChart({ type: 'image/png' }),
    }),
    [],
  );

  const handlePointClick = useCallback(
    function pointClick(e) {
      if (onPointClick) onPointClick(this, e);
    },
    [onPointClick],
  );

  const options = useMemo(() => {
    const normalized = normalizeSeries({ series, data, name, kind, preset, mode });
    const seriesCount = normalized.length;
    // Two or more series always need a legend. Part-to-whole charts need one
    // too even with a single series, because there the *points* are the
    // entities being identified.
    const pointsAreEntities = ['pie', 'donut', 'funnel'].includes(kind);
    const wantsLegend =
      legend === undefined ? seriesCount > 1 || pointsAreEntities : legend;
    const useSharedTooltip =
      sharedTooltip ??
      ['line', 'spline', 'area', 'areaspline', 'stacked-area', 'column', 'stacked-column', 'percent-column', 'bar', 'stacked-bar']
        .includes(kind);

    const presetOptions = preset.options ? preset.options({ mode, chrome, kind }) : {};
    const isPercentStack = kind === 'percent-column' || stacking === 'percent';
    const gaugeColor =
      kind === 'gauge' ? normalized[0]?.color || theme.colors[0] : null;

    // Layer 4: the convenience props, expressed as plain Highcharts options.
    const propOptions = {
      chart: {
        height,
        inverted,
        polar,
        animation: animation ? undefined : false,
        events: {},
      },
      // null, not undefined: undefined leaves Highcharts' default "Chart title"
      // in place, and the real heading lives in the card above the plot.
      title: { text: title ?? null },
      subtitle: { text: subtitle ?? null },
      accessibility: {
        enabled: true,
        description: accessibilityDescription || subtitle || title,
      },
      xAxis: preset.needsAxes
        ? {
            categories: categories || undefined,
            type: xType || undefined,
            title: { text: xTitle ?? null },
            crosshair: useSharedTooltip ? { width: 1, color: chrome.gridline } : false,
          }
        : undefined,
      yAxis: preset.needsAxes
        ? {
            title: { text: yTitle ?? null },
            min: yMin,
            max: yMax,
            // A solid gauge takes its fill from the axis stops, not from the
            // series colour, so mirror the series colour into a single stop.
            ...(gaugeColor ? { stops: [[0, gaugeColor]] } : {}),
            labels: {
              // A percent stack's axis is a share, whatever unit the values
              // are in — money on the axis of a 100% stack reads as a bug.
              // Category axes (a heatmap's weekdays) hand the formatter a
              // string; pass those through untouched instead of NaN-ing them.
              formatter() {
                if (typeof this.value !== 'number') return this.value;
                return getFormatter(isPercentStack ? 'percent' : format)(this.value, 0);
              },
            },
          }
        : undefined,
      legend: {
        enabled: Boolean(wantsLegend),
        ...(typeof legend === 'object' && legend !== null ? legend : {}),
      },
      tooltip: buildTooltip({
        shared: useSharedTooltip,
        format,
        digits,
        chrome,
        valueSuffix,
        percent: isPercentStack,
      }),
      plotOptions: {
        series: {
          stacking,
          animation: animation ? undefined : false,
          // Only install a formatter when labels were actually asked for.
          // Setting one unconditionally would hijack the label of any series
          // that turns labels on itself — a treemap labels by name, not by y,
          // and would render a column of "–".
          dataLabels: dataLabels
            ? {
                enabled: true,
                formatter() {
                  return getFormatter(format)(this.y, digits);
                },
              }
            : { enabled: false },
          point: {
            events: onPointClick ? { click: handlePointClick } : {},
          },
          events: onSeriesToggle
            ? {
                legendItemClick(e) {
                  onSeriesToggle(this.name, !this.visible, e);
                },
              }
            : {},
        },
      },
      exporting: {
        enabled: exporting,
        buttons: { contextButton: { menuItems: ['viewFullscreen', 'downloadPNG', 'downloadSVG', 'downloadCSV'] } },
      },
      series: normalized,
    };

    return mergeAll(theme, presetOptions, propOptions, userOptions);
  }, [
    theme, chrome, mode, kind, preset, series, data, name, categories, title, subtitle,
    xTitle, yTitle, xType, yMin, yMax, format, digits, valueSuffix, stacking, inverted,
    polar, height, legend, sharedTooltip, dataLabels, exporting, animation,
    accessibilityDescription, onPointClick, onSeriesToggle, handlePointClick, userOptions,
  ]);

  // Highcharts only listens to window resize. In a CSS grid a card can change
  // width without the window doing anything, so drive reflow off the element.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => chartComponentRef.current?.chart?.reflow());
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={className} ref={containerRef} style={{ width: '100%' }}>
      <HighchartsReact
        // A theme swap changes colours the redraw path does not fully repaint
        // (gradients, pane backgrounds), so rebuild the chart on mode change.
        key={`${kind}-${mode}`}
        highcharts={Highcharts}
        constructorType={constructorType}
        options={options}
        ref={chartComponentRef}
        containerProps={{ style: { width: '100%' } }}
      />
    </div>
  );
});

export default Chart;
