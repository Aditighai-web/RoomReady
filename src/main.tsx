import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global uncaught error listener to help diagnostics in preview iframe
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('RoomReady Window Error caught:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('RoomReady Unhandled Promise Rejection:', event.reason);
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.error('Fatal: #root element not found in DOM');
}

