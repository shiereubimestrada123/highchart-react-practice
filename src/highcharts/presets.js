import { CHROME, DIVERGING, SEQUENTIAL_BLUE } from './palette';

/**
 * Friendly chart "kinds" → Highcharts config.
 *
 * A kind is what a person asks for ("a donut", "a stacked column chart"); a
 * Highcharts `series.type` is what the library wants. Several kinds share one
 * series type and differ only in options — donut is a pie with an inner size,
 * a radar is a line chart with `chart.polar` — so keeping the mapping in one
 * table stops that knowledge from being copy-pasted into every call site.
 *
 * Each entry:
 *   seriesType — what goes on `series[].type`
 *   options(ctx) — extra options merged *under* the caller's own props
 *   needsAxes — false for pie-like charts, so the axis props are skipped
 */

export const PRESETS = {
  line: { seriesType: 'line', needsAxes: true },

  spline: { seriesType: 'spline', needsAxes: true },

  area: {
    seriesType: 'area',
    needsAxes: true,
    options: () => ({ plotOptions: { area: { fillOpacity: 0.18 } } }),
  },

  areaspline: { seriesType: 'areaspline', needsAxes: true },

  'stacked-area': {
    seriesType: 'areaspline',
    needsAxes: true,
    options: () => ({
      plotOptions: { areaspline: { stacking: 'normal', fillOpacity: 0.6 } },
    }),
  },

  column: { seriesType: 'column', needsAxes: true },

  /**
   * Columns you can click into. The points are the entities here — one bar per
   * thing, each carrying a `drilldown` id that names a series in
   * `options.drilldown.series` — so they take their colour per point and the
   * legend goes away.
   *
   * Drill-down keeps one chart where a dashboard would otherwise sprout five.
   * It only pays off when the second level answers the question the first one
   * raises; if people have to drill to get the point at all, the top level is
   * showing the wrong thing.
   */
  drilldown: {
    seriesType: 'column',
    needsAxes: true,
    options: () => ({
      // Points identify themselves by name rather than by an axis category
      // list, which is what lets a drill level swap in its own points.
      xAxis: { type: 'category' },
      legend: { enabled: false },
      plotOptions: { column: { colorByPoint: true } },
    }),
  },

  'stacked-column': {
    seriesType: 'column',
    needsAxes: true,
    options: () => ({ plotOptions: { column: { stacking: 'normal' } } }),
  },

  'percent-column': {
    seriesType: 'column',
    needsAxes: true,
    // The tooltip shows share *and* absolute value; see buildTooltip in Chart.jsx.
    options: () => ({
      plotOptions: { column: { stacking: 'percent' } },
      yAxis: { max: 100 },
    }),
  },

  bar: { seriesType: 'bar', needsAxes: true },

  'stacked-bar': {
    seriesType: 'bar',
    needsAxes: true,
    options: () => ({ plotOptions: { bar: { stacking: 'normal' } } }),
  },

  pie: {
    seriesType: 'pie',
    needsAxes: false,
    options: () => ({
      plotOptions: {
        pie: {
          showInLegend: true,
          dataLabels: { enabled: true, format: '{point.name}' },
        },
      },
    }),
  },

  donut: {
    seriesType: 'pie',
    needsAxes: false,
    options: () => ({
      plotOptions: {
        pie: {
          innerSize: '62%',
          showInLegend: true,
          dataLabels: { enabled: false },
        },
      },
    }),
  },

  scatter: {
    seriesType: 'scatter',
    needsAxes: true,
    options: () => ({
      // Scatter puts every series on screen at once, so cap identity colours at
      // three slots (see palette notes) and lean on shape as a second channel.
      plotOptions: {
        scatter: { marker: { symbol: 'circle' } },
      },
      xAxis: { gridLineWidth: 1 },
    }),
  },

  bubble: {
    seriesType: 'bubble',
    needsAxes: true,
    options: () => ({
      plotOptions: { bubble: { minSize: 12, maxSize: '18%' } },
      xAxis: { gridLineWidth: 1 },
    }),
  },

  heatmap: {
    seriesType: 'heatmap',
    needsAxes: true,
    options: ({ mode }) => ({
      chart: { marginTop: 48 },
      colorAxis: {
        min: 0,
        stops: SEQUENTIAL_BLUE.map((hex, i) => [
          i / (SEQUENTIAL_BLUE.length - 1),
          hex,
        ]),
      },
      yAxis: { gridLineWidth: 0, title: null },
      legend: {
        align: 'right',
        layout: 'horizontal',
        verticalAlign: 'top',
        y: -4,
        symbolHeight: 10,
      },
      plotOptions: {
        heatmap: { borderColor: CHROME[mode].surface, borderWidth: 2 },
      },
    }),
  },

  treemap: {
    seriesType: 'treemap',
    needsAxes: false,
    options: () => ({
      colorAxis: { minColor: SEQUENTIAL_BLUE[1], maxColor: SEQUENTIAL_BLUE[10] },
      legend: { enabled: false },
      plotOptions: {
        treemap: {
          // Labels sit *on* the ramp, which runs light to dark — 'contrast'
          // lets Highcharts pick black or white per tile.
          dataLabels: { color: 'contrast', style: { textOutline: 'none' } },
        },
      },
    }),
  },

  gauge: {
    seriesType: 'solidgauge',
    needsAxes: true,
    options: ({ mode }) => ({
      chart: { type: 'solidgauge' },
      pane: {
        center: ['50%', '74%'],
        size: '130%',
        startAngle: -90,
        endAngle: 90,
        // `background` is a list, even when there is only one track.
        background: [
          {
            backgroundColor: CHROME[mode].gridline,
            innerRadius: '68%',
            outerRadius: '100%',
            shape: 'arc',
            borderWidth: 0,
          },
        ],
      },
      yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickWidth: 0,
        minorTickInterval: null,
        gridLineWidth: 0,
        labels: { enabled: false },
      },
      legend: { enabled: false },
      tooltip: { enabled: false },
      plotOptions: {
        solidgauge: {
          innerRadius: '68%',
          // Enabled here rather than at the `series` level so it survives the
          // component's global "labels off unless asked for" default: a gauge
          // with no readout is just a coloured arc.
          dataLabels: { enabled: true, y: -26, borderWidth: 0, useHTML: true },
        },
      },
    }),
  },

  funnel: {
    seriesType: 'funnel',
    needsAxes: false,
    options: () => ({
      plotOptions: {
        funnel: {
          neckWidth: '28%',
          neckHeight: '22%',
          width: '68%',
          center: ['42%', '50%'],
          showInLegend: true,
          // Direct labels are the default elsewhere, but a funnel's late
          // stages are only a few pixels tall — the connector lines end up
          // crossing each other. Identity moves to the legend, values to the
          // tooltip and the table.
          dataLabels: { enabled: false },
        },
      },
    }),
  },

  radar: {
    seriesType: 'line',
    needsAxes: true,
    options: () => ({
      chart: { polar: true },
      xAxis: { tickmarkPlacement: 'on', lineWidth: 0, gridLineWidth: 1 },
      yAxis: { gridLineInterpolation: 'polygon', min: 0, labels: { enabled: false } },
      plotOptions: { line: { marker: { radius: 4 } } },
    }),
  },

  streamgraph: {
    seriesType: 'streamgraph',
    needsAxes: true,
    options: () => ({
      yAxis: { visible: false },
      xAxis: { gridLineWidth: 0, lineWidth: 0 },
    }),
  },

  sankey: {
    seriesType: 'sankey',
    needsAxes: false,
    options: () => ({ legend: { enabled: false } }),
  },

  dependencywheel: {
    seriesType: 'dependencywheel',
    needsAxes: false,
    options: () => ({ legend: { enabled: false } }),
  },

  boxplot: {
    seriesType: 'boxplot',
    needsAxes: true,
    options: ({ mode }) => ({
      plotOptions: {
        boxplot: {
          fillColor: CHROME[mode].plane,
          lineWidth: 2,
          medianWidth: 2,
          whiskerLength: '60%',
          whiskerWidth: 2,
        },
      },
      legend: { enabled: false },
    }),
  },

  waterfall: {
    seriesType: 'waterfall',
    needsAxes: true,
    options: ({ mode }) => ({
      plotOptions: {
        waterfall: {
          lineWidth: 1,
          lineColor: CHROME[mode].baseline,
          borderRadius: 4,
          upColor: DIVERGING.low,
          color: DIVERGING.high,
          // The middle bars float and are often only a few pixels tall, so
          // labels go above them rather than inside.
          dataLabels: {
            enabled: true,
            inside: false,
            verticalAlign: 'top',
            y: -18,
            crop: false,
            overflow: 'allow',
            color: CHROME[mode].textSecondary,
            format: '{point.y:,.0f}',
          },
        },
      },
      legend: { enabled: false },
    }),
  },

  /** A stripped-down inline chart for stat tiles: no axes, no chrome. */
  sparkline: {
    seriesType: 'areaspline',
    needsAxes: true,
    options: () => ({
      chart: { margin: [2, 2, 2, 2], height: 48, backgroundColor: 'transparent' },
      title: { text: null },
      subtitle: { text: null },
      xAxis: { visible: false },
      yAxis: { visible: false },
      legend: { enabled: false },
      credits: { enabled: false },
      exporting: { enabled: false },
      tooltip: { outside: true, headerFormat: '', pointFormat: '<b>{point.y:,.0f}</b>' },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.16,
          lineWidth: 2,
          marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } },
          states: { hover: { lineWidth: 2 } },
        },
      },
    }),
  },

  /**
   * A mixed chart. The caller sets `type` per series; nothing here forces one.
   * Note there is deliberately no dual-axis preset: two y-scales in one frame
   * is the single most misread chart there is. Two units → two charts.
   */
  combo: { seriesType: undefined, needsAxes: true },
};

export const CHART_KINDS = Object.keys(PRESETS);

/** Unknown kinds fall through as a raw Highcharts series type. */
export function getPreset(kind) {
  return PRESETS[kind] || { seriesType: kind, needsAxes: true };
}
