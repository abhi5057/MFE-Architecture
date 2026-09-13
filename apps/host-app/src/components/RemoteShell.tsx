import React, { Suspense } from 'react';

interface RemoteShellProps {
  title: string;
  children: React.ReactNode;
}

const fallback = (
  <div
    aria-live="polite"
    className="rounded-lg border border-slate-300 bg-white p-6 text-sm dark:border-slate-700 dark:bg-slate-900"
    role="status"
  >
    Loading widget...
  </div>
);

export const RemoteShell: React.FC<RemoteShellProps> = ({ title, children }) => {
  return (
    <section className="space-y-3 rounded-xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Suspense fallback={fallback}>{children}</Suspense>
    </section>
  );
};
