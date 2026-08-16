import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Streams points into an already-rendered chart.
 *
 * Deliberately imperative: pushing a new `series` array through props once a
 * second makes React rebuild the options object and Highcharts diff the whole
 * series on every tick. `series.addPoint()` appends one point and animates it,
 * which is both cheaper and smoother. This is the one place where reaching for
 * the chart instance is the right call rather than a shortcut.
 *
 * Returns the ref you hand to <Chart ref={…}> plus running state and controls.
 */
export default function useLiveSeries({
  chartRef,
  intervalMs = 1000,
  maxPoints = 60,
  nextValue,
  autoStart = true,
}) {
  const [running, setRunning] = useState(autoStart);
  const [latest, setLatest] = useState(null);
  const timerRef = useRef(null);
  const valueRef = useRef(nextValue);
  valueRef.current = nextValue;

  const tick = useCallback(() => {
    const chart = chartRef.current?.chart;
    const series = chart?.series?.[0];
    if (!series) return;

    const last = series.data[series.data.length - 1];
    const value = valueRef.current(last?.y ?? 0);
    const point = [Date.now(), value];

    // shift = true drops the oldest point once the window is full, so the
    // series never grows without bound during a long session.
    series.addPoint(point, true, series.data.length >= maxPoints);
    setLatest(value);
  }, [chartRef, maxPoints]);

  useEffect(() => {
    if (!running) return undefined;
    timerRef.current = setInterval(tick, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [running, intervalMs, tick]);

  // Pause while the tab is hidden: background timers still cost work, and a
  // returning user does not want to watch 400 queued points animate in.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) clearInterval(timerRef.current);
      else if (running) timerRef.current = setInterval(tick, intervalMs);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [running, intervalMs, tick]);

  return {
    running,
    latest,
    start: () => setRunning(true),
    stop: () => setRunning(false),
    toggle: () => setRunning((r) => !r),
    pushNow: tick,
  };
}
