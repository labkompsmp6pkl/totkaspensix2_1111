
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MathJaxContext } from 'better-react-mathjax';
import './index.css';
import { initGlobalErrorLogging } from './utils/logger';
import ErrorBoundary from './components/ErrorBoundary';

// Initialize global error logging
initGlobalErrorLogging();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Konfigurasi MathJax v3 untuk better-react-mathjax
const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true
  }
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <MathJaxContext config={mathJaxConfig}>
        <App />
      </MathJaxContext>
    </ErrorBoundary>
  </React.StrictMode>
);
