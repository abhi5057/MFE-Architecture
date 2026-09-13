import React, { Suspense } from 'react';

interface RemoteShellProps {
  title: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class RemoteErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          Remote widget is temporarily unavailable. Please ensure the corresponding MFE server is running.
        </div>
      );
    }

    return this.props.children;
  }
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
      <RemoteErrorBoundary>
        <Suspense fallback={fallback}>{children}</Suspense>
      </RemoteErrorBoundary>
    </section>
  );
};
