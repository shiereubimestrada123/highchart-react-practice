import { useMemo, useState } from 'react';
import Chart from '../components/Chart';
import ChartCard from '../components/ChartCard';
import { regionRevenue } from '../data/datasets';

/**
 * Change the props, watch the chart change.
 *
 * The same data goes into every kind here, which is the quickest way to feel
 * why the form matters: the numbers that read clearly as a stacked column turn
 * into mush as a pie, and a 100% stack answers a different question than the
 * absolute stack right next to it.
 */

// Kinds that all accept the same category + series shape.
const KINDS = [
  'line', 'spline', 'area', 'areaspline', 'stacked-area',
  'column', 'stacked-column', 'percent-column', 'bar', 'stacked-bar',
  'radar', 'streamgraph', 'pie', 'donut', 'funnel', 'drilldown',
];

const SINGLE_SERIES_KINDS = new Set(['pie', 'donut', 'funnel']);

/** URL-safe id for a drill level, e.g. "North America" → "north-america". */
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const FORMATS = ['number', 'compact', 'money', 'percent'];

const SERIES_COUNTS = [1, 2, 3];

export default function PlaygroundPage() {
  const [kind, setKind] = useState('column');
  const [seriesCount, setSeriesCount] = useState(3);
  const [format, setFormat] = useState('money');
  const [dataLabels, setDataLabels] = useState(false);
  const [legend, setLegend] = useState(true);
  const [height, setHeight] = useState(360);
  const [animation, setAnimation] = useState(true);

  // Kinds whose data gets collapsed into one series of named points, rather
  // than one series per motion. They read from the same table shape.
  const isCollapsed = SINGLE_SERIES_KINDS.has(kind) || kind === 'drilldown';

  // A drill-down's one series is coloured per point, so a legend for it would
  // be a single grey swatch reading "Revenue" — identity is already on the
  // axis. The control is disabled rather than ignored, so the reason is visible.
  const legendApplies = kind !== 'drilldown';
  const effectiveLegend = legendApplies && legend;

  const chartProps = useMemo(() => {
    const active = regionRevenue.series.slice(0, seriesCount);

    if (kind === 'drilldown') {
      // Top level: one column per region, totalled across the active motions.
      // Each point names the drill level it opens.
      const data = regionRevenue.categories.map((name, i) => ({
        name,
        y: active.reduce((sum, s) => sum + s.data[i], 0),
        drilldown: slug(name),
      }));

      // Second level: the same region split by motion. One series per region,
      // matched to the point above it by `id`.
      const drilldownSeries = regionRevenue.categories.map((name, i) => ({
        id: slug(name),
        name,
        type: 'column',
        data: active.map((s) => [s.name, s.data[i]]),
      }));

      return {
        series: [{ name: 'Revenue', data }],
        options: { drilldown: { series: drilldownSeries } },
      };
    }

    if (SINGLE_SERIES_KINDS.has(kind)) {
      // Part-to-whole kinds want one series of named slices, so collapse the
      // grouped data by category.
      const data = regionRevenue.categories.map((name, i) => ({
        name,
        y: active.reduce((sum, s) => sum + s.data[i], 0),
      }));
      return { series: [{ name: 'Revenue', data, colorByPoint: true }] };
    }

    return { categories: regionRevenue.categories, series: active };
  }, [kind, seriesCount]);

  const snippet = useMemo(
    () =>
      [
        '<Chart',
        `  kind="${kind}"`,
        kind === 'drilldown'
          ? '  series={[{ name: "Revenue", data }]}\n' +
            '  options={{ drilldown: { series: drilldownSeries } }}'
          : SINGLE_SERIES_KINDS.has(kind)
            ? '  series={[{ name: "Revenue", data, colorByPoint: true }]}'
            : '  categories={categories}\n  series={series}',
        `  format="${format}"`,
        `  height={${height}}`,
        effectiveLegend ? null : '  legend={false}',
        dataLabels ? '  dataLabels' : null,
        animation ? null : '  animation={false}',
        '/>',
      ]
        .filter(Boolean)
        .join('\n'),
    [kind, format, height, effectiveLegend, dataLabels, animation],
  );

  return (
    <>
      <div className="intro">
        <h1>Playground</h1>
        <p>
          One dataset, sixteen forms. The generated call is under the chart — the whole
          API surface of the wrapper is visible in it.
        </p>
      </div>

      <div className="playground">
        <aside className="controls" aria-label="Chart options">
          <Field label="Kind">
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </Field>

          <Field label="Series">
            <div className="segmented">
              {SERIES_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={seriesCount === n ? 'seg on' : 'seg'}
                  onClick={() => setSeriesCount(n)}
                  disabled={SINGLE_SERIES_KINDS.has(kind)}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Value format">
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>

          <Field label={`Height — ${height}px`}>
            <input
              type="range"
              min="200"
              max="560"
              step="20"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </Field>

          <Check
            label="Legend"
            checked={effectiveLegend}
            onChange={setLegend}
            disabled={!legendApplies}
          />
          <Check label="Data labels" checked={dataLabels} onChange={setDataLabels} />
          <Check label="Animation" checked={animation} onChange={setAnimation} />

          <p className="muted small">
            Kind, series count and format all change the options object; the component
            rebuilds it in a <code>useMemo</code> keyed on those props, so nothing
            re-merges on an unrelated re-render.
          </p>
        </aside>

        <div className="playground-main">
          <ChartCard
            title="Revenue by region"
            subtitle={`kind="${kind}"`}
            note={
              kind === 'drilldown'
                ? 'Click a column to open that region, then use the breadcrumb to come back. The second level is the same region split by motion — the series count control decides how many motions are in it.'
                : undefined
            }
            table={
              isCollapsed
                ? { series: chartProps.series, categoryLabel: 'Region', format }
                : { categories: chartProps.categories, series: chartProps.series, format, categoryLabel: 'Region' }
            }
          >
            <Chart
              {...chartProps}
              kind={kind}
              format={format}
              height={height}
              legend={effectiveLegend}
              dataLabels={dataLabels}
              animation={animation}
              yTitle={isCollapsed && kind !== 'drilldown' ? undefined : 'Revenue ($k)'}
            />
          </ChartCard>

          <ChartCard title="The call that renders it" subtitle="Copy this into your own page">
            <pre className="snippet">{snippet}</pre>
          </ChartCard>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function Check({ label, checked, onChange, disabled = false }) {
  return (
    <label className="check" data-disabled={disabled || undefined}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
