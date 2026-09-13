import React from 'react';
import { createRoot } from 'react-dom/client';
import DashboardWidget from './DashboardWidget';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <main className="mx-auto max-w-4xl p-4">
        <DashboardWidget />
      </main>
    </React.StrictMode>
  );
}
