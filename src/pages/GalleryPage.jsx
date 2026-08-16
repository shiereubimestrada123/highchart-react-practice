import Chart from '../components/Chart';
import ChartCard from '../components/ChartCard';
import { useTheme } from '../theme/useTheme';
import { DIVERGING, SEQUENTIAL_BLUE } from '../highcharts/palette';
import {
  activityHeatmap,
  browserShare,
  budgetWaterfall,
  deviceSplit,
  featureUsage,
  funnelStages,
  latencyBoxplot,
  planMix,
  regionRevenue,
  responseTimes,
  revenueTrend,
  scatterSample,
  signupSankey,
  storageTreemap,
  streamData,
  teamSkills,
  trafficByChannel,
} from '../data/datasets';

/**
 * One card per chart kind — the reference sheet.
 *
 * Every card below uses the same <Chart> component; the differences are all
 * props. Read this page top to bottom as "how do I ask for X".
 */
export default function GalleryPage() {
  const { mode, chrome } = useTheme();

  return (
    <>
      <PageIntro />

      <h2 className="section-title">Change over time</h2>
      <div className="grid">
        <ChartCard
          title="Revenue by product line"
          subtitle="Monthly recognised revenue, this year"
          table={{ ...revenueTrend, format: 'money' }}
          note="Three series, one scale. Two different units would need two charts — never a second y-axis."
        >
          <Chart
            kind="line"
            {...revenueTrend}
            format="money"
            yTitle="Revenue"
            accessibilityDescription="Monthly revenue for three product lines, all trending up"
          />
        </ChartCard>

        <ChartCard
          title="Sessions by channel"
          subtitle="Stacked area, thousands of sessions"
          table={{ ...trafficByChannel, format: 'compact' }}
        >
          <Chart kind="stacked-area" {...trafficByChannel} format="compact" yTitle="Sessions (k)" />
        </ChartCard>

        <ChartCard
          title="Response time percentiles"
          subtitle="Smoothed line, milliseconds"
          table={{ ...responseTimes, categoryLabel: 'Day' }}
        >
          <Chart kind="spline" {...responseTimes} valueSuffix=" ms" yTitle="ms" />
        </ChartCard>

        <ChartCard
          title="Document activity"
          subtitle="Streamgraph — shape of the mix, not exact values"
          table={{ ...streamData }}
          note="A streamgraph reads shape well and values badly. Ship the table with it."
        >
          <Chart kind="streamgraph" {...streamData} height={300} />
        </ChartCard>
      </div>

      <h2 className="section-title">Comparison</h2>
      <div className="grid">
        <ChartCard
          title="Revenue by region"
          subtitle="Grouped columns"
          table={{ ...regionRevenue, format: 'money' }}
        >
          <Chart kind="column" {...regionRevenue} format="money" />
        </ChartCard>

        <ChartCard
          title="Revenue by region"
          subtitle="Stacked — totals matter more than parts"
          table={{ ...regionRevenue, format: 'money' }}
        >
          <Chart kind="stacked-column" {...regionRevenue} format="money" />
        </ChartCard>

        <ChartCard
          title="Revenue mix by region"
          subtitle="100% stacked — parts matter more than totals"
          table={{ ...regionRevenue, format: 'money' }}
        >
          <Chart kind="percent-column" {...regionRevenue} format="money" />
        </ChartCard>

        <ChartCard
          title="Revenue by region"
          subtitle="Horizontal bars — long category names fit"
          table={{ ...regionRevenue, format: 'money' }}
        >
          <Chart kind="stacked-bar" {...regionRevenue} format="money" height={300} />
        </ChartCard>
      </div>

      <h2 className="section-title">Composition</h2>
      <div className="grid">
        <ChartCard
          title="Accounts by plan"
          subtitle="Pie — five slices is already the ceiling"
          table={{ series: [{ name: 'Accounts', data: planMix }], categoryLabel: 'Plan' }}
        >
          <Chart
            kind="pie"
            series={[{ name: 'Accounts', data: planMix }]}
            format="compact"
            height={300}
          />
        </ChartCard>

        <ChartCard
          title="Sessions by device"
          subtitle="Donut with the headline in the hole"
          table={{ series: [{ name: 'Share', data: deviceSplit }], format: 'percent', digits: 1, categoryLabel: 'Device' }}
        >
          <Chart
            kind="donut"
            series={[{ name: 'Share', data: deviceSplit }]}
            format="percent"
            digits={1}
            height={300}
            options={{
              title: {
                text: `<div style="text-align:center"><div style="font-size:26px;font-weight:600;color:${chrome.textPrimary}">58%</div><div style="font-size:12px;color:${chrome.textSecondary}">desktop</div></div>`,
                useHTML: true,
                align: 'center',
                verticalAlign: 'middle',
                y: 12,
              },
            }}
          />
        </ChartCard>

        <ChartCard
          title="Signup funnel"
          subtitle="Stage-to-stage drop-off"
          table={{ series: [{ name: 'Users', data: funnelStages }], format: 'compact', categoryLabel: 'Stage' }}
        >
          <Chart
            kind="funnel"
            series={[{ name: 'Users', data: funnelStages, colorByPoint: true }]}
            format="compact"
            height={340}
            sharedTooltip={false}
          />
        </ChartCard>

        <ChartCard
          title="Storage by bucket"
          subtitle="Treemap — magnitude on one hue, light to dark"
          table={{ series: [{ name: 'GB', data: storageTreemap }], categoryLabel: 'Bucket' }}
        >
          <Chart
            kind="treemap"
            series={[
              {
                name: 'Storage',
                data: storageTreemap,
                layoutAlgorithm: 'squarified',
                dataLabels: { enabled: true, style: { textOutline: 'none', fontWeight: '500' } },
              },
            ]}
            height={300}
          />
        </ChartCard>
      </div>

      <h2 className="section-title">Relationships & distribution</h2>
      <div className="grid">
        <ChartCard
          title="Cohort scatter"
          subtitle="Three series — the all-pairs cap for point clouds"
          note="Scatter shows every series at once, so identity colours stop at three. A fourth becomes a facet."
        >
          <Chart
            kind="scatter"
            {...scatterSample}
            xTitle="Days since signup"
            yTitle="Actions per week"
            sharedTooltip={false}
          />
        </ChartCard>

        <ChartCard
          title="Feature adoption"
          subtitle="Bubble — the third value is seat count"
        >
          <Chart
            kind="bubble"
            {...featureUsage}
            xTitle="Engagement score"
            yTitle="Retention %"
            sharedTooltip={false}
            options={{
              tooltip: {
                useHTML: true,
                pointFormat:
                  '<b>{point.name}</b><br/>Engagement {point.x} · Retention {point.y}%<br/>{point.z:,.0f} seats',
                headerFormat: '',
              },
            }}
          />
        </ChartCard>

        <ChartCard
          title="Latency distribution"
          subtitle="Box plot — median, quartiles, whiskers"
        >
          <Chart
            kind="boxplot"
            categories={latencyBoxplot.categories}
            series={[{ name: 'Latency', data: latencyBoxplot.data, color: DIVERGING.low }]}
            yTitle="ms"
            sharedTooltip={false}
          />
        </ChartCard>

        <ChartCard
          title="Traffic by hour and weekday"
          subtitle="Heatmap — one hue carries magnitude"
        >
          <Chart
            kind="heatmap"
            categories={activityHeatmap.xCategories}
            series={[
              {
                name: 'Sessions',
                borderWidth: 2,
                data: activityHeatmap.data,
                dataLabels: { enabled: false },
              },
            ]}
            height={300}
            sharedTooltip={false}
            options={{
              yAxis: { categories: activityHeatmap.yCategories, reversed: true },
              xAxis: { title: { text: 'Hour' } },
              tooltip: {
                useHTML: true,
                formatter() {
                  const day = activityHeatmap.yCategories[this.point.y];
                  const hour = activityHeatmap.xCategories[this.point.x];
                  return `<b>${this.point.value}</b> sessions<br/>${day} at ${hour}:00`;
                },
              },
            }}
          />
        </ChartCard>
      </div>

      <h2 className="section-title">Specialised</h2>
      <div className="grid">
        <ChartCard
          title="ARR bridge"
          subtitle="Waterfall — how the opening balance became the closing one"
          note="Diverging pair: blue adds, red subtracts, and the sum column closes the story."
        >
          <Chart
            kind="waterfall"
            series={[{ name: 'ARR', data: budgetWaterfall }]}
            categories={budgetWaterfall.map((p) => p.name)}
            format="money"
            yTitle="ARR ($k)"
            sharedTooltip={false}
          />
        </ChartCard>

        <ChartCard title="Team profile" subtitle="Radar — a small fixed set of axes">
          <Chart kind="radar" {...teamSkills} height={320} sharedTooltip />
        </ChartCard>

        <ChartCard
          title="Signup flow"
          subtitle="Sankey — where the volume actually goes"
        >
          <Chart
            kind="sankey"
            series={[{ name: 'Flow', data: signupSankey, keys: ['from', 'to', 'weight'] }]}
            height={320}
            sharedTooltip={false}
          />
        </ChartCard>

        <ChartCard
          title="Browser share"
          subtitle="Click a column to drill into versions"
          note="Drill-down keeps one chart where a dashboard would otherwise sprout five."
        >
          <Chart
            kind="column"
            series={browserShare.series}
            format="percent"
            digits={1}
            xType="category"
            legend={false}
            dataLabels
            sharedTooltip={false}
            options={{
              drilldown: {
                ...browserShare.drilldown,
                series: browserShare.drilldown.series.map((s) => ({
                  ...s,
                  type: 'column',
                  color: SEQUENTIAL_BLUE[mode === 'dark' ? 6 : 7],
                })),
              },
            }}
          />
        </ChartCard>
      </div>
    </>
  );
}

function PageIntro() {
  return (
    <div className="intro">
      <h1>Chart gallery</h1>
      <p>
        Every chart on this page is the same <code>&lt;Chart /&gt;</code> component with
        different props. Switch the theme in the header — the palette re-steps for the dark
        surface rather than flipping, and every card keeps its colours.
      </p>
    </div>
  );
}
