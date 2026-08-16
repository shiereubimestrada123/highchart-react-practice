import { useMemo, useRef, useState } from 'react';
import Chart from '../components/Chart';
import ChartCard from '../components/ChartCard';
import useLiveSeries from '../hooks/useLiveSeries';
import { useTheme } from '../theme/useTheme';
import { CATEGORICAL, STATUS } from '../highcharts/palette';
import { fmtNumber } from '../utils/format';
import { seedLiveSeries } from '../data/datasets';

/**
 * Streaming data, and the imperative escape hatch.
 *
 * The chart is created once from props. After that, points arrive through
 * `chart.series[0].addPoint()` rather than through a new options object — see
 * hooks/useLiveSeries.js for why. The ref exposed by <Chart> is what makes that
 * possible without leaking the wrapper.
 */
export default function LivePage() {
  const { mode, chrome } = useTheme();
  const chartRef = useRef(null);
  const [seed] = useState(() => seedLiveSeries(60));

  const { running, latest, toggle, pushNow } = useLiveSeries({
    chartRef,
    intervalMs: 1000,
    maxPoints: 60,
    // A random walk that stays in a plausible band.
    nextValue: (previous) => {
      const drift = (Math.random() - 0.5) * 44;
      return Math.round(Math.min(520, Math.max(90, (previous || 240) + drift)));
    },
  });

  const current = latest ?? seed[seed.length - 1][1];
  const level = current > 400 ? 'critical' : current > 300 ? 'warning' : 'good';

  const liveSeries = useMemo(
    () => [{ name: 'Requests / sec', colorIndex: 0, data: seed }],
    [seed],
  );

  return (
    <>
      <div className="intro">
        <h1>Live data</h1>
        <p>
          One chart created from props, then fed one point per second through the
          Highcharts instance. Re-rendering the whole series every tick would work and
          would also be wasteful — and it would kill the point animation.
        </p>
      </div>

      <div className="filter-row">
        <button type="button" className="primary-btn" onClick={toggle}>
          {running ? 'Pause stream' : 'Resume stream'}
        </button>
        <button type="button" className="ghost-btn" onClick={pushNow} disabled={running}>
          Add one point
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => chartRef.current?.exportPNG()}
        >
          Export PNG
        </button>
        <p className="filter-summary">
          {/* Status is icon + label + colour, never colour on its own. */}
          <span aria-hidden="true" style={{ color: STATUS[level] }}>●</span>{' '}
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtNumber(current)}</strong> req/s ·{' '}
          {level === 'good' ? 'nominal' : level === 'warning' ? 'elevated' : 'critical'}
        </p>
      </div>

      <div className="grid">
        <ChartCard
          span={2}
          title="Request rate"
          subtitle="Rolling 60-second window, one point per second"
          note="Bands mark the alert thresholds so a spike is legible without reading the axis."
        >
          <Chart
            ref={chartRef}
            kind="areaspline"
            series={liveSeries}
            xType="datetime"
            height={320}
            yTitle="req/s"
            legend={false}
            valueSuffix=" req/s"
            options={{
              chart: { animation: { duration: 300 } },
              xAxis: {
                labels: { format: '{value:%H:%M:%S}' },
                tickPixelInterval: 120,
              },
              yAxis: {
                min: 0,
                softMax: 520,
                plotBands: [
                  { from: 300, to: 400, color: hexAlpha(STATUS.warning, 0.10) },
                  { from: 400, to: 10000, color: hexAlpha(STATUS.critical, 0.10) },
                ],
              },
              plotOptions: {
                areaspline: {
                  marker: { enabled: false },
                  fillOpacity: 0.16,
                  color: CATEGORICAL[mode][0],
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard title="Current load" subtitle="Against the 500 req/s ceiling">
          <Chart
            kind="gauge"
            height={240}
            series={[
              {
                name: 'Load',
                data: [Math.round((current / 500) * 100)],
                color: STATUS[level],
                dataLabels: {
                  format: `<div style="text-align:center"><span style="font-size:24px;font-weight:600;color:${chrome.textPrimary}">{y}%</span><br/><span style="font-size:11px;color:${chrome.textSecondary}">of capacity</span></div>`,
                },
              },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="What the ref gives you"
          subtitle="Anything the Highcharts API can do"
        >
          <div className="prose">
            <p>
              <code>&lt;Chart ref={'{ref}'} /&gt;</code> exposes a narrow surface —{' '}
              <code>ref.current.chart</code> for the live instance, plus{' '}
              <code>reflow()</code> and <code>exportPNG()</code>.
            </p>
            <pre>
{`const chartRef = useRef(null);

// append a point without re-rendering React
chartRef.current.chart.series[0].addPoint(
  [Date.now(), 218], true, true,
);

// drive selection from outside the chart
chartRef.current.chart.series[0].points[3].select();

// download the current view
chartRef.current.exportPNG();`}
            </pre>
            <p className="muted">
              Keep this for genuinely imperative work — streaming, exporting, focus.
              Anything declarative belongs in props, where React can reason about it.
            </p>
          </div>
        </ChartCard>
      </div>
    </>
  );
}

/** Highcharts takes rgba strings for plot bands; hex + alpha is easier to read. */
function hexAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
