import Chart from './Chart';
import { useTheme } from '../theme/useTheme';

/**
 * A headline number with a sparkline.
 *
 * Worth remembering that a single number is often the right "chart": one value
 * with a delta reads faster as text than as a one-bar bar chart. The sparkline
 * is supporting shape, not the message, which is why it carries no axes.
 */
export default function StatTile({ label, value, delta, deltaLabel, spark, colorIndex = 0 }) {
  const { chrome } = useTheme();
  const up = typeof delta === 'number' && delta > 0;
  const flat = !delta;
  const deltaColor = flat ? chrome.textMuted : up ? chrome.positive : chrome.negative;

  return (
    <div className="stat-tile">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {delta !== undefined ? (
        <p className="stat-delta" style={{ color: deltaColor }}>
          {/* Icon + text, never colour alone. */}
          <span aria-hidden="true">{flat ? '→' : up ? '▲' : '▼'}</span>{' '}
          {Math.abs(delta)}% <span className="stat-delta-label">{deltaLabel}</span>
        </p>
      ) : null}
      {spark ? (
        <Chart
          kind="sparkline"
          height={48}
          exporting={false}
          series={[{ name: label, data: spark, colorIndex }]}
          accessibilityDescription={`Trend for ${label}`}
        />
      ) : null}
    </div>
  );
}
