import { createContext } from 'react';
import { CHROME } from '../highcharts/palette';

/**
 * Lives in its own file so ThemeProvider.jsx only exports a component — which
 * is what keeps Vite's fast refresh working for it.
 */
export const ThemeContext = createContext({
  mode: 'light',
  chrome: CHROME.light,
  setMode: () => {},
  toggle: () => {},
});

export const STORAGE_KEY = 'hc-practice:theme';
