import { getFormatter } from '../utils/format';

/**
 * The table view every chart can fall back to.
 *
 * This is not a nice-to-have. Three of the light-mode series colours sit below
 * 3:1 against the chart surface, and colour alone never carries meaning — so a
 * readable table of the same numbers is what makes the chart accessible, along
 * with the legend and the direct labels.
 */
export default function DataTable({ categories = [], series = [], format = 'number', digits = 0, categoryLabel = 'Category' }) {
  const fmt = getFormatter(format);

  const rows = categories.length
    ? categories.map((cat, i) => ({
        label: cat,
        values: series.map((s) => pointValue(s.data?.[i])),
      }))
    : // No categories: fall back to one row per point of the first series.
      (series[0]?.data || []).map((_, i) => ({
        label: pointName(series[0].data[i]) ?? `#${i + 1}`,
        values: series.map((s) => pointValue(s.data?.[i])),
      }));

  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="visually-hidden">
          Tabular version of the chart above
        </caption>
        <thead>
          <tr>
            <th scope="col">{categoryLabel}</th>
            {series.map((s) => (
              <th scope="col" key={s.name} className="num">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((v, i) => (
                <td key={series[i]?.name ?? i} className="num">
                  {fmt(v, digits)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Points come in three shapes: 5, [x, y] and { y: 5 }. Handle all of them. */
function pointValue(point) {
  if (point === null || point === undefined) return null;
  if (typeof point === 'number') return point;
  if (Array.isArray(point)) return point[point.length - 1];
  return point.y ?? null;
}

function pointName(point) {
  if (point && typeof point === 'object' && !Array.isArray(point)) return point.name;
  return null;
}
