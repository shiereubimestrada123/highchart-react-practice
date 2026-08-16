import { createContext } from 'react';

/**
 * How a ChartCard reaches the chart inside it.
 *
 * The card renders `{children}` opaquely, so it cannot see the chart it wraps —
 * and threading a ref through all ~25 call sites would be worse than the
 * problem. Instead the card publishes this, and <Chart> registers itself.
 *
 * Lives in its own file so ChartCard.jsx keeps exporting only a component,
 * which is what keeps Vite's fast refresh working for it — same split as
 * theme/context.js and theme/ThemeProvider.jsx.
 *
 *   title          the card's heading, used to name exported files
 *   registerChart  called with the chart's API on mount, null on unmount
 */
export const ChartCardContext = createContext({
  title: undefined,
  registerChart: null,
});
