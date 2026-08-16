import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext, STORAGE_KEY } from './context';
import { CHROME } from '../highcharts/palette';

function systemMode() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Holds the light/dark choice for both the page and the charts.
 *
 * Dark mode is a *selected* palette, not an inverted one: the charts read their
 * dark hues from palette.js, which re-steps the same eight colours for a dark
 * surface. See useChartTheme() in ./useTheme.js for the chart half.
 */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : systemMode();
  });

  // Stamp the choice on <html> so the CSS custom properties swap with it.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Follow the OS only until the user makes an explicit choice.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => setMode((m) => (m === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(
    () => ({ mode, setMode, toggle, chrome: CHROME[mode] }),
    [mode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
