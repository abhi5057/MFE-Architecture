import React, { useEffect, useMemo, useState } from 'react';

interface Account {
  id: string;
  accountNumber: string;
  type: string;
  balance: number;
}

interface TransferEventDetail {
  eventId: string;
  amount: number;
  beneficiary: string;
  reference: string;
  sourceAccountId: string;
}

const ACCOUNTS_STORAGE_KEY = 'dashboard-mfe-accounts';
const PROCESSED_EVENTS_STORAGE_KEY = 'dashboard-mfe-processed-transfer-events';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

const initialAccounts: Account[] = [
  { id: 'checking-1123', accountNumber: '**** 1123', type: 'Checking', balance: 12500 },
  { id: 'savings-8931', accountNumber: '**** 8931', type: 'Savings', balance: 20500 }
];

const getStoredAccounts = (): Account[] => {
  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!raw) {
    return initialAccounts;
  }

  try {
    const parsed = JSON.parse(raw) as Account[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return initialAccounts;
  }

  return initialAccounts;
};

const getProcessedEvents = (): Set<string> => {
  const raw = localStorage.getItem(PROCESSED_EVENTS_STORAGE_KEY);
  if (!raw) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
  } catch {
    return new Set<string>();
  }

  return new Set<string>();
};

const DashboardWidget: React.FC = () => {
  const [{ accounts, lastTransfer }, setDashboardState] = useState<{
    accounts: Account[];
    lastTransfer: TransferEventDetail | null;
  }>({
    accounts: getStoredAccounts(),
    lastTransfer: null
  });

  const [processedEvents, setProcessedEvents] = useState<Set<string>>(() => getProcessedEvents());

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(PROCESSED_EVENTS_STORAGE_KEY, JSON.stringify(Array.from(processedEvents)));
  }, [processedEvents]);

  useEffect(() => {
    const onTransfer = (event: Event) => {
      const customEvent = event as CustomEvent<TransferEventDetail>;
      const detail = customEvent.detail;
      if (!detail || detail.amount <= 0 || !detail.sourceAccountId || !detail.eventId || processedEvents.has(detail.eventId)) {
        return;
      }

      setDashboardState((current) => {
        const sourceAccountExists = current.accounts.some((account) => account.id === detail.sourceAccountId);
        if (!sourceAccountExists) {
          return current;
        }

        const nextAccounts = current.accounts.map((account) => {
          if (account.id !== detail.sourceAccountId) {
            return account;
          }
          return { ...account, balance: account.balance - detail.amount };
        });

        return {
          accounts: nextAccounts,
          lastTransfer: detail
        };
      });
      setProcessedEvents((current) => {
        const next = new Set(current);
        next.add(detail.eventId);
        return next;
      });
    };

    window.addEventListener('banking:transfer-completed', onTransfer as EventListener);
    return () => window.removeEventListener('banking:transfer-completed', onTransfer as EventListener);
  }, [processedEvents]);

  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + account.balance, 0), [accounts]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
        <p className="text-sm text-slate-600 dark:text-slate-200">Active Balance</p>
        <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {accounts.map((account) => (
          <article className="rounded-lg border border-slate-200 p-3 dark:border-slate-700" key={account.accountNumber}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{account.type}</p>
            <p className="mt-1 font-medium">{account.accountNumber}</p>
            <p className="mt-2 text-lg font-semibold">{formatCurrency(account.balance)}</p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-600">
        <h3 className="font-medium">Transaction Summary</h3>
        {lastTransfer ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Last transfer: {formatCurrency(lastTransfer.amount)} to {lastTransfer.beneficiary} ({lastTransfer.reference})
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No recent transfer events received.</p>
        )}
      </section>
    </div>
  );
};

export default DashboardWidget;
