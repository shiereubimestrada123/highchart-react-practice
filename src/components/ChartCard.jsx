import { useId, useState } from 'react';
import DataTable from './DataTable';
import ErrorBoundary from './ErrorBoundary';

/**
 * The frame around a chart: heading, optional controls, a footnote, and the
 * "Show data" toggle that swaps the plot for a table of the same numbers.
 *
 * The heading lives in HTML rather than in `chart.title` so it participates in
 * the page's document outline and is selectable/searchable like normal text.
 */
export default function ChartCard({
  title,
  subtitle,
  note,
  actions,
  table, // { categories, series, format, digits, categoryLabel }
  span = 1,
  children,
}) {
  const [showTable, setShowTable] = useState(false);
  const bodyId = useId();

  return (
    <section className="card" style={{ gridColumn: `span ${span}` }}>
      <header className="card-head">
        <div className="card-heading">
          <h3>{title}</h3>
          {subtitle ? <p className="card-sub">{subtitle}</p> : null}
        </div>
        <div className="card-actions">
          {actions}
          {table ? (
            <button
              type="button"
              className="ghost-btn"
              aria-expanded={showTable}
              aria-controls={bodyId}
              onClick={() => setShowTable((v) => !v)}
            >
              {showTable ? 'Show chart' : 'Show data'}
            </button>
          ) : null}
        </div>
      </header>

      <div className="card-body" id={bodyId}>
        {showTable && table ? (
          <DataTable {...table} />
        ) : (
          <ErrorBoundary>{children}</ErrorBoundary>
        )}
      </div>

      {note ? <p className="card-note">{note}</p> : null}
    </section>
  );
}
