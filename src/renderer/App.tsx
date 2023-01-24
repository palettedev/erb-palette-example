import {
  init,
  events,
  vitals,
  measure,
  network,
  profiler,
  paint,
  debounce,
} from '@palette.dev/electron/renderer';
import { useRef, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

init({
  key: 'clbqxiwme0001kw08zgamvn60',
  plugins: [events(), vitals(), network(), measure(), profiler(), paint()],
});

// Simulate jank by blocking the main thread for < 50ms
const throttleInput = () => {
  const ms = 50 * Math.random();
  const start = Date.now();
  while (Date.now() < start + ms) {} // eslint-disable-line no-empty
};

const Hello = () => (
  <textarea
    placeholder="type something"
    onChange={throttleInput}
    style={{ width: '100%', height: '100%', padding: 10 }}
  />
);

export default function App() {
  const debounceProfiler = useRef(
    debounce(
      () => profiler.stop(),
      () => profiler.start({ sampleInterval: 10, maxBufferSize: 100_000 })
    )
  );

  // Profile page interactions
  //   * Collect samples every 10ms
  //   * Start the profiler on click, keypress, pointermove, and wheel events
  //   * Stop the profiler after 1s of inactivity
  useEffect(() => {
    const ref = debounceProfiler.current;

    window.addEventListener('click', ref, { capture: true });
    window.addEventListener('keypress', ref, { capture: true });
    window.addEventListener('pointermove', ref, { capture: true });
    window.addEventListener('wheel', ref, { capture: true });

    return () => {
      window.removeEventListener('click', ref);
      window.removeEventListener('keypress', ref);
      window.removeEventListener('pointermove', ref);
      window.removeEventListener('wheel', ref);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
