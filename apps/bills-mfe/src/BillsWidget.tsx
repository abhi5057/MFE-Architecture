import React, { useState } from 'react';

interface Bill {
  id: string;
  service: string;
  category: string;
  dueDate: string;
  amount: number;
}

const initialBills: Bill[] = [
  { id: 'u1', service: 'Power Grid', category: 'Electricity', dueDate: '2026-10-05', amount: 132.4 },
  { id: 'u2', service: 'City Water', category: 'Water', dueDate: '2026-10-08', amount: 58.12 },
  { id: 'u3', service: 'Internet Fiber', category: 'Telecom', dueDate: '2026-10-11', amount: 79.99 }
];

const BillsWidget: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(initialBills);

  const markPaid = (id: string) => {
    setBills((current) => current.filter((bill) => bill.id !== id));
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Service Management</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {bills.map((bill) => (
          <article className="flex flex-col justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700" key={bill.id}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{bill.category}</p>
              <h4 className="mt-1 font-medium">{bill.service}</h4>
              <p className="mt-2 text-sm">Due: {bill.dueDate}</p>
              <p className="mt-2 text-lg font-semibold">${bill.amount.toFixed(2)}</p>
            </div>
            <button className="mt-4 rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700" onClick={() => markPaid(bill.id)} type="button">
              Pay Bill
            </button>
          </article>
        ))}
      </div>
      {bills.length === 0 ? <p className="rounded border border-dashed border-slate-300 p-3 text-sm dark:border-slate-600">All bills are paid.</p> : null}
    </section>
  );
};

export default BillsWidget;
