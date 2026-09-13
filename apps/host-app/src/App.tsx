import React, { lazy, useMemo } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { RemoteShell } from './components/RemoteShell';

const DashboardWidget = lazy(() => import('dashboardMfe/DashboardWidget'));
const TransferWidget = lazy(() => import('transferMfe/TransferWidget'));
const BillsWidget = lazy(() => import('billsMfe/BillsWidget'));

type DashboardView = 'dashboard' | 'transfer' | 'bills';

const toDashboardView = (value: string | null): DashboardView => {
  if (value === 'transfer' || value === 'bills') {
    return value;
  }

  return 'dashboard';
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '').trim();
    if (!username) {
      return;
    }
    login(username);
    const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
    const canRestoreRoute = Boolean(from?.pathname?.startsWith('/dashboard'));
    const target = canRestoreRoute ? `${from?.pathname ?? '/dashboard'}${from?.search ?? ''}` : '/dashboard?view=dashboard';
    navigate(target);
  };

  return (
    <main className="mx-auto mt-16 max-w-md rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h1 className="mb-4 text-2xl font-bold">Banking Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800" name="username" placeholder="Username" required />
        <input className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800" name="password" placeholder="Password" type="password" required />
        <button className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" type="submit">Sign In</button>
      </form>
      <Link className="mt-4 inline-block text-sm text-blue-600 underline" to="/recover">
        Forgot password?
      </Link>
    </main>
  );
};

const RecoverPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard?view=dashboard" />;
  }

  return (
    <main className="mx-auto mt-16 max-w-md rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h1 className="mb-3 text-xl font-semibold">Password Recovery</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">This is a local-first stub. In production this would send a secure recovery link.</p>
      <button className="mt-5 rounded bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900" onClick={() => navigate('/login')} type="button">
        Back to Login
      </button>
    </main>
  );
};

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { logout, username } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const view = useMemo(() => toDashboardView(params.get('view')), [params]);

  const goToView = (nextView: DashboardView) => {
    const next = new URLSearchParams(location.search);
    next.set('view', nextView);
    navigate({ pathname: '/dashboard', search: `?${next.toString()}` });
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4 md:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Banking Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Welcome, {username}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded border border-slate-300 px-3 py-1.5 dark:border-slate-600" onClick={toggleTheme} type="button">
            Theme: {theme}
          </button>
          <button
            className="rounded bg-rose-600 px-3 py-1.5 text-white"
            onClick={() => {
              logout();
              navigate('/login', { replace: true, state: {} });
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">
        {(['dashboard', 'transfer', 'bills'] as DashboardView[]).map((item) => (
          <button
            className={`rounded px-4 py-2 text-sm ${view === item ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600'}`}
            key={item}
            onClick={() => goToView(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="grid gap-4">
        {view === 'dashboard' && (
          <RemoteShell title="Account Overview">
            <DashboardWidget />
          </RemoteShell>
        )}
        {view === 'transfer' && (
          <RemoteShell title="Fund Transfer">
            <TransferWidget />
          </RemoteShell>
        )}
        {view === 'bills' && (
          <RemoteShell title="Bill Payments">
            <BillsWidget />
          </RemoteShell>
        )}
      </div>
    </main>
  );
};

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <>{children}</>;
};

const CatchAllRedirect: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard?view=dashboard" />;
  }

  return <Navigate replace state={{ from: location }} to="/login" />;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recover" element={<RecoverPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
};
