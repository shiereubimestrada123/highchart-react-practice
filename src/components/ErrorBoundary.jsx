import { Component } from 'react';

/**
 * Keeps one broken subtree from taking the page down with it.
 *
 * Charting libraries throw on bad data — a null where a number was expected, a
 * series type whose module was never imported. Without a boundary that becomes
 * a blank white page; with one it becomes a card that says what went wrong.
 *
 * Error boundaries still have to be class components; there is no hook for it.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Where a real app would call its error reporter.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    const { title = 'This chart could not be drawn', children } = this.props;
    if (!error) return children;

    return (
      <div className="chart-error" role="alert">
        <p className="chart-error-title">{title}</p>
        <p className="chart-error-msg">{error.message}</p>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => this.setState({ error: null })}
        >
          Try again
        </button>
      </div>
    );
  }
}
