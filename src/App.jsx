import { useState } from 'react';
import { ThemeProvider } from './theme/ThemeProvider';
import { useTheme } from './theme/useTheme';
import GalleryPage from './pages/GalleryPage';
import DashboardPage from './pages/DashboardPage';
import LivePage from './pages/LivePage';
import PlaygroundPage from './pages/PlaygroundPage';
import './App.css';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', Component: DashboardPage },
  { id: 'gallery', label: 'Gallery', Component: GalleryPage },
  { id: 'live', label: 'Live data', Component: LivePage },
  { id: 'playground', label: 'Playground', Component: PlaygroundPage },
];

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}

function Shell() {
  const [page, setPage] = useState('dashboard');
  const { mode, toggle } = useTheme();
  const Active = PAGES.find((p) => p.id === page).Component;

  return (
    <div className="app">
      <header className="app-head">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Highcharts × React</span>
        </div>

        <nav aria-label="Sections">
          {PAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-current={page === p.id ? 'page' : undefined}
              className={page === p.id ? 'nav-btn on' : 'nav-btn'}
              onClick={() => setPage(p.id)}
            >
              {p.label}
            </button>
          ))}
        </nav>

        <button type="button" className="ghost-btn" onClick={toggle}>
          {mode === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </header>

      <main className="app-main">
        <Active />
      </main>

      <footer className="app-foot">
        <p>
          Practice project — Vite + React 19 + Highcharts 13. Highcharts itself is free
          for personal and non-commercial use; a commercial project needs a licence from
          Highsoft.
        </p>
      </footer>
    </div>
  );
}
