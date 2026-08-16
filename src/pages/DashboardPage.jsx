import { useMemo, useState } from 'react';
import Chart from '../components/Chart';
import ChartCard from '../components/ChartCard';
import StatTile from '../components/StatTile';
import { useTheme } from '../theme/useTheme';
import { STATUS } from '../highcharts/palette';
import { fmtCompact } from '../utils/format';
import {
  MONTHS,
  kpis,
  planMix,
  regionRevenue,
  revenueTrend,
  trafficByChannel,
} from '../data/datasets';

const RANGES = [
  { id: '3m', label: 'Last 3 months', months: 3 },
  { id: '6m', label: 'Last 6 months', months: 6 },
  { id: '12m', label: 'Last 12 months', months: 12 },
];

/**
 * A small dashboard: filters in one row above the charts, KPI tiles, then the
 * plots. Filtering removes series and shortens ranges — note that the colours
 * never move when a series is switched off, because each series carries a
 * stable `colorIndex` instead of taking whatever slot it lands in.
 */
export default function DashboardPage() {
  const { chrome } = useTheme();
  const [range, setRange] = useState('12m');
  const [hidden, setHidden] = useState(() => new Set());

  const months = RANGES.find((r) => r.id === range).months;

  const trend = useMemo(() => {
    const categories = revenueTrend.categories.slice(-months);
    const series = revenueTrend.series
      .filter((s) => !hidden.has(s.name))
      .map((s) => ({ ...s, data: s.data.slice(-months) }));
    return { categories, series };
  }, [months, hidden]);

  const traffic = useMemo(() => {
    const take = Math.min(months, trafficByChannel.categories.length);
    return {
      categories: trafficByChannel.categories.slice(-take),
      series: trafficByChannel.series.map((s) => ({ ...s, data: s.data.slice(-take) })),
    };
  }, [months]);

  const totalRevenue = trend.series.reduce(
    (sum, s) => sum + s.data.reduce((a, b) => a + b, 0),
    0,
  );

  const toggleSeries = (name) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <>
      <div className="intro">
        <h1>Revenue dashboard</h1>
        <p>
          Filters sit in one row above the plots, never inside them. Toggling a product
          line off leaves the survivors on their original colours.
        </p>
      </div>

      {/* One filter row, above everything it affects. */}
      <div className="filter-row" role="group" aria-label="Dashboard filters">
        <div className="segmented" role="radiogroup" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={range === r.id}
              className={range === r.id ? 'seg on' : 'seg'}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="chips" role="group" aria-label="Product lines">
          {revenueTrend.series.map((s) => {
            const on = !hidden.has(s.name);
            return (
              <button
                key={s.name}
                type="button"
                aria-pressed={on}
                className={on ? 'chip on' : 'chip'}
                onClick={() => toggleSeries(s.name)}
              >
                <span
                  className="chip-swatch"
                  style={{ background: on ? undefined : 'transparent' }}
                  data-slot={s.colorIndex}
                />
                {s.name}
              </button>
            );
          })}
        </div>

        <p className="filter-summary">
          {fmtCompact(totalRevenue)} total over {months} months
        </p>
      </div>

      <div className="tiles">
        {kpis.map((k) => (
          <StatTile key={k.label} {...k} />
        ))}
      </div>

      <div className="grid">
        <ChartCard
          span={2}
          title="Revenue by product line"
          subtitle={`Last ${months} months`}
          table={{ ...trend, format: 'money' }}
        >
          <Chart
            kind="area"
            {...trend}
            format="money"
            height={340}
            yTitle="Revenue"
            onSeriesToggle={(name) => toggleSeries(name)}
          />
        </ChartCard>

        <ChartCard title="Sessions by channel" subtitle="Stacked" table={{ ...traffic, format: 'compact' }}>
          <Chart kind="stacked-column" {...traffic} format="compact" height={300} />
        </ChartCard>

        <ChartCard
          title="Accounts by plan"
          subtitle="Share of paid and free accounts"
          table={{ series: [{ name: 'Accounts', data: planMix }], categoryLabel: 'Plan' }}
        >
          <Chart
            kind="donut"
            series={[{ name: 'Accounts', data: planMix }]}
            format="compact"
            height={300}
          />
        </ChartCard>

        <ChartCard title="Regional split" subtitle="Revenue by motion" table={{ ...regionRevenue, format: 'money' }}>
          <Chart kind="bar" {...regionRevenue} format="money" height={300} />
        </ChartCard>

        <ChartCard
          title="Uptime against target"
          subtitle="99.95% SLA"
          note="A gauge for one number against one threshold — anything richer wants a time series."
        >
          <Chart
            kind="gauge"
            height={260}
            series={[
              {
                name: 'Uptime',
                data: [99.97],
                color: STATUS.good,
                dataLabels: {
                  format: `<div style="text-align:center"><span style="font-size:24px;font-weight:600;color:${chrome.textPrimary}">{y}%</span><br/><span style="font-size:11px;color:${chrome.textSecondary}">30-day uptime</span></div>`,
                },
              },
            ]}
            options={{ yAxis: { min: 99.5, max: 100 } }}
          />
        </ChartCard>

        <ChartCard
          title="Bookings vs forecast"
          subtitle="Combo: actuals as columns, forecast as a line"
          note="Both series are dollars on one scale — that is what makes a combo legitimate here."
        >
          <Chart
            kind="combo"
            categories={MONTHS}
            format="money"
            height={300}
            series={[
              { type: 'column', name: 'Actual', colorIndex: 0, data: revenueTrend.series[0].data },
              {
                type: 'spline',
                name: 'Forecast',
                colorIndex: 1,
                dashStyle: 'ShortDash',
                marker: { enabled: false },
                data: revenueTrend.series[0].data.map((v, i) => Math.round(v * (1.04 + i * 0.004))),
              },
            ]}
          />
        </ChartCard>
      </div>
    </>
  );
}
