import React from 'react';
import { createRoot } from 'react-dom/client';
import BillsWidget from './BillsWidget';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <main className="mx-auto max-w-4xl p-4">
        <BillsWidget />
      </main>
    </React.StrictMode>
  );
}
