/**
 * One place to register every Highcharts module the app uses.
 *
 * Highcharts 12+ modules are side-effect imports — you import the file and it
 * attaches itself to the Highcharts instance. (On older versions you had to
 * call the imported factory yourself: `exporting(Highcharts)`.)
 *
 * Import order matters: `highcharts` itself must be evaluated first, which is
 * why every module import lives below the main one in this single file, and why
 * the rest of the app imports Highcharts from here rather than from the package.
 */
import Highcharts from 'highcharts';

// Extra series types.
import 'highcharts/highcharts-more'; // bubble, polar, boxplot, error bars, gauge
import 'highcharts/modules/solid-gauge';
import 'highcharts/modules/heatmap';
import 'highcharts/modules/treemap';
import 'highcharts/modules/funnel';
import 'highcharts/modules/sankey';
import 'highcharts/modules/dependency-wheel';
import 'highcharts/modules/streamgraph';

// Behaviour / chrome.
import 'highcharts/modules/drilldown';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data'; // "Download CSV" in the export menu
import 'highcharts/modules/accessibility';
import 'highcharts/modules/no-data-to-display';
import 'highcharts/modules/pattern-fill'; // the texture channel for CVD / print

/**
 * Global defaults that are not visual theming — those live in theme.js so they
 * can swap with light/dark. Anything here is true in every mode.
 */
Highcharts.setOptions({
  lang: {
    thousandsSep: ',',
    noData: 'No data to display',
  },
  time: {
    // Render timestamps in the viewer's own timezone rather than UTC.
    useUTC: false,
  },
  credits: { enabled: false },
});

// Handy while learning: in dev you can poke at Highcharts.charts from the
// browser console. Not exposed in production builds.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.Highcharts = Highcharts;
}

export default Highcharts;
