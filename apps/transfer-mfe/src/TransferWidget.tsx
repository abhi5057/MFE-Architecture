import React, { useState } from 'react';

interface Beneficiary {
  id: string;
  name: string;
  account: string;
}

interface TransferEventDetail {
  amount: number;
  beneficiary: string;
  reference: string;
}

const beneficiaries: Beneficiary[] = [
  { id: 'b1', name: 'Utilities HQ', account: '*** 9213' },
  { id: 'b2', name: 'Corporate Savings', account: '*** 3321' },
  { id: 'b3', name: 'Payroll Account', account: '*** 8122' }
];

const TransferWidget: React.FC = () => {
  const [status, setStatus] = useState<string>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const amount = Number(formData.get('amount'));
    const beneficiaryId = String(formData.get('beneficiary') ?? '');
    const reference = String(formData.get('reference') ?? '').trim() || 'N/A';

    const beneficiary = beneficiaries.find((item) => item.id === beneficiaryId);
    if (!beneficiary || !Number.isFinite(amount) || amount <= 0) {
      setStatus('Please fill out a valid transfer form.');
      return;
    }

    const detail: TransferEventDetail = {
      amount,
      beneficiary: beneficiary.name,
      reference
    };

    window.dispatchEvent(new CustomEvent<TransferEventDetail>('banking:transfer-completed', { detail }));
    setStatus(`Transfer executed: $${amount.toFixed(2)} to ${beneficiary.name}`);
    event.currentTarget.reset();
  };

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1 text-sm">
        Beneficiary
        <select className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800" defaultValue="" name="beneficiary" required>
          <option disabled value="">
            Select beneficiary
          </option>
          {beneficiaries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.account})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Amount
        <input className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800" min="1" name="amount" required step="0.01" type="number" />
      </label>

      <label className="md:col-span-2 flex flex-col gap-1 text-sm">
        Reference
        <input className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800" name="reference" placeholder="Invoice / reason" />
      </label>

      <button className="md:col-span-2 rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" type="submit">
        Execute Transfer
      </button>
      {status ? <p className="md:col-span-2 text-sm text-slate-600 dark:text-slate-300">{status}</p> : null}
    </form>
  );
};

export default TransferWidget;
