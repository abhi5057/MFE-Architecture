import React, { useEffect, useMemo, useState } from 'react';

interface Account {
  id: string;
  accountNumber: string;
  type: string;
  balance: number;
}

interface TransferEventDetail {
  amount: number;
  beneficiary: string;
  reference: string;
  sourceAccountId: string;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

const initialAccounts: Account[] = [
  { id: 'checking-1123', accountNumber: '**** 1123', type: 'Checking', balance: 12500 },
  { id: 'savings-8931', accountNumber: '**** 8931', type: 'Savings', balance: 20500 }
];

const DashboardWidget: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [lastTransfer, setLastTransfer] = useState<TransferEventDetail | null>(null);

  useEffect(() => {
    const onTransfer = (event: Event) => {
      const customEvent = event as CustomEvent<TransferEventDetail>;
      const detail = customEvent.detail;
      if (!detail || detail.amount <= 0 || !detail.sourceAccountId) {
        return;
      }

      let didUpdate = false;
      setAccounts((current) => {
        const next = current.map((account) => {
          if (account.id !== detail.sourceAccountId) {
            return account;
          }
          didUpdate = true;
          return { ...account, balance: Math.max(0, account.balance - detail.amount) };
        });
        return didUpdate ? next : current;
      });
      if (didUpdate) {
        setLastTransfer(detail);
      }
    };

    window.addEventListener('banking:transfer-completed', onTransfer as EventListener);
    return () => window.removeEventListener('banking:transfer-completed', onTransfer as EventListener);
  }, []);

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
