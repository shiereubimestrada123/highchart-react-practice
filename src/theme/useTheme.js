import { useContext, useMemo } from 'react';
import { ThemeContext } from './context';
import { buildTheme } from '../highcharts/theme';
import { CHROME } from '../highcharts/palette';

/** Current mode plus the page-chrome tokens for it. */
export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * The Highcharts theme object for the active mode.
 * Memoised on mode, so a re-render never rebuilds (and re-merges) it.
 */
export function useChartTheme() {
  const { mode } = useTheme();
  return useMemo(
    () => ({ mode, theme: buildTheme(mode), chrome: CHROME[mode] }),
    [mode],
  );
}
