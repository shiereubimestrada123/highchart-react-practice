import { CATEGORICAL, CHROME, FONT_STACK } from './palette';

/**
 * Returns the Highcharts options that carry *look* for a given mode.
 *
 * Deliberately not applied with Highcharts.setOptions(): a global mutation only
 * affects charts created afterwards, so a theme toggle would leave every mounted
 * chart on the old palette. Merging the theme into each chart's options instead
 * keeps the switch reactive, which is the React-shaped way to do it.
 */
export function buildTheme(mode = 'light') {
  const c = CHROME[mode] || CHROME.light;
  const colors = CATEGORICAL[mode] || CATEGORICAL.light;

  const axisDefaults = {
    lineColor: c.baseline,
    tickColor: c.baseline,
    gridLineColor: c.gridline,
    gridLineWidth: 0,
    labels: {
      style: { color: c.textMuted, fontSize: '12px', fontFamily: FONT_STACK },
    },
    title: {
      style: { color: c.textSecondary, fontSize: '12px', fontFamily: FONT_STACK },
    },
  };

  return {
    colors,

    chart: {
      backgroundColor: c.surface,
      plotBorderColor: c.border,
      style: { fontFamily: FONT_STACK },
      spacing: [16, 12, 12, 8],
      animation: { duration: 350 },
    },

    title: {
      align: 'left',
      margin: 24,
      style: {
        color: c.textPrimary,
        fontSize: '16px',
        fontWeight: '600',
      },
    },

    subtitle: {
      align: 'left',
      style: { color: c.textSecondary, fontSize: '13px' },
    },

    // Recessive chrome: horizontal hairlines only, no vertical grid.
    xAxis: { ...axisDefaults },
    yAxis: {
      ...axisDefaults,
      gridLineWidth: 1,
      lineWidth: 0,
      tickWidth: 0,
    },

    legend: {
      align: 'left',
      x: -6,
      itemStyle: { color: c.textSecondary, fontWeight: '400', fontSize: '12px' },
      itemHoverStyle: { color: c.textPrimary },
      itemHiddenStyle: { color: c.textMuted },
      symbolRadius: 2,
      symbolHeight: 10,
      symbolWidth: 10,
    },

    tooltip: {
      backgroundColor: c.tooltipBg,
      borderColor: c.border,
      borderRadius: 8,
      borderWidth: 1,
      shadow: false,
      padding: 10,
      style: { color: c.textPrimary, fontSize: '12px' },
      // Values line up in a column, so tabular figures earn their keep here.
      useHTML: true,
    },

    plotOptions: {
      series: {
        borderWidth: 0,
        // A 2px surface gap between adjacent fills keeps stacked segments and
        // neighbouring bars from bleeding into one another.
        crisp: false,
        states: {
          hover: { brightness: 0.06 },
          inactive: { opacity: 0.35 },
        },
        dataLabels: {
          color: c.textSecondary,
          style: { fontSize: '11px', fontWeight: '500', textOutline: 'none' },
        },
      },
      line: { lineWidth: 2, marker: { radius: 4, symbol: 'circle' } },
      spline: { lineWidth: 2, marker: { radius: 4, symbol: 'circle' } },
      area: { lineWidth: 2, fillOpacity: 0.18 },
      areaspline: { lineWidth: 2, fillOpacity: 0.18 },
      column: {
        borderRadius: 4, // rounded data-end, square baseline
        groupPadding: 0.14,
        pointPadding: 0.04,
        borderColor: c.surface,
        borderWidth: 2,
      },
      bar: {
        borderRadius: 4,
        groupPadding: 0.14,
        pointPadding: 0.04,
        borderColor: c.surface,
        borderWidth: 2,
      },
      pie: {
        borderColor: c.surface,
        borderWidth: 2,
        dataLabels: { color: c.textSecondary, connectorColor: c.baseline },
      },
      scatter: { marker: { radius: 5 } },
      bubble: { marker: { fillOpacity: 0.55, lineColor: c.surface, lineWidth: 2 } },
      treemap: { borderColor: c.surface, borderWidth: 2 },
      heatmap: { borderColor: c.surface, borderWidth: 2 },
    },

    // NB: no `colorAxis` here. Declaring one globally makes *every* cartesian
    // chart colour its series from the sequential ramp and replaces the legend
    // with a colour bar. The sequential ramp belongs to the two kinds that
    // actually encode magnitude with it — see the heatmap and treemap presets.

    drilldown: {
      activeAxisLabelStyle: { color: c.textPrimary, textDecoration: 'none' },
      activeDataLabelStyle: { color: c.textPrimary, textDecoration: 'none' },
      breadcrumbs: {
        buttonTheme: { style: { color: c.textSecondary } },
      },
    },

    navigation: {
      buttonOptions: {
        theme: { fill: 'transparent' },
        symbolStroke: c.textMuted,
      },
      menuStyle: {
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: '8px',
        boxShadow: 'none',
      },
      menuItemStyle: { color: c.textSecondary, fontSize: '13px' },
      menuItemHoverStyle: { background: c.plane, color: c.textPrimary },
    },

    noData: {
      style: { color: c.textMuted, fontSize: '13px', fontWeight: '400' },
    },
  };
}
