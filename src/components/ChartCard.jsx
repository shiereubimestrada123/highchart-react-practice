import { useId, useMemo, useState } from 'react';
import DataTable from './DataTable';
import ErrorBoundary from './ErrorBoundary';
import { ChartCardContext } from './chartCardContext';

/**
 * The frame around a chart: heading, optional controls, a footnote, and the
 * "Show data" toggle that swaps the plot for a table of the same numbers.
 *
 * The heading lives in HTML rather than in `chart.title` so it participates in
 * the page's document outline and is selectable/searchable like normal text.
 * It doubles as the export filename — see chartCardContext.js.
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
  // Set by whatever <Chart> renders inside this card, if any. Cards holding
  // prose rather than a chart simply never get one, and show no CSV button.
  const [chartApi, setChartApi] = useState(null);
  const bodyId = useId();

  const cardContext = useMemo(
    () => ({ title, registerChart: setChartApi }),
    [title],
  );

  return (
    <section className="card" style={{ gridColumn: `span ${span}` }}>
      <header className="card-head">
        <div className="card-heading">
          <h3>{title}</h3>
          {subtitle ? <p className="card-sub">{subtitle}</p> : null}
        </div>
        <div className="card-actions">
          {actions}
          {/*
            Labelled "CSV" rather than "Download CSV": the longer text pushed
            headings onto a second line on the narrowest cards. The accessible
            name stays whole.
          */}
          {chartApi?.canExport ? (
            <button
              type="button"
              className="ghost-btn"
              aria-label={title ? `Download ${title} as CSV` : 'Download CSV'}
              onClick={() => chartApi.downloadCSV()}
            >
              CSV
            </button>
          ) : null}
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
        <ChartCardContext.Provider value={cardContext}>
          {showTable && table ? (
            <DataTable {...table} />
          ) : (
            <ErrorBoundary>{children}</ErrorBoundary>
          )}
        </ChartCardContext.Provider>
      </div>

      {note ? <p className="card-note">{note}</p> : null}
    </section>
  );
}
