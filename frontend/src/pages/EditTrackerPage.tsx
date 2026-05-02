import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { fetchFundraiser, ApiFundraiserDetail } from '../services/api';

export type EvidenceStatus = 'evidenced' | 'needs_note' | 'income';

export interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number; // negative = debit, positive = credit
  note: string;
  files: string[];
  status: EvidenceStatus;
}

interface EditTrackerPageProps {
  fundraiserId: string;
  fundraiserName?: string;
  fundraiserBank?: string;
  onBack?: () => void;
  onSave?: (transactions: Transaction[]) => void;
}

const FileIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path d="M3 12V2.5L7 1h4v11H3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M7 1v3H3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const statusConfig: Record<EvidenceStatus, { label: string; className: string }> = {
  evidenced:  { label: 'Evidenced',   className: 'badge badge-green' },
  needs_note: { label: 'Needs note',  className: 'badge badge-amber' },
  income:     { label: 'Income',      className: 'badge badge-gray'  },
};

const EditTrackerPage: React.FC<EditTrackerPageProps> = ({
  fundraiserId,
  fundraiserName,
  fundraiserBank,
  onBack,
  onSave,
}) => {
  const [detail, setDetail] = useState<ApiFundraiserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!fundraiserId) return;
    setLoading(true);
    fetchFundraiser(fundraiserId)
      .then(data => {
        setDetail(data);
        setTransactions(data.Transactions.map((t, i) => ({
          id: String(i),
          description: t.Payee,
          date: t.Date,
          amount: -t.Amount,
          note: t.Description,
          files: t.File ? [t.File] : [],
          status: t.Amount > 0 ? 'income' : 'needs_note',
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fundraiserId]);

  const displayName = fundraiserName ?? detail?.Name ?? 'Fundraiser';
  const displayBank = fundraiserBank ?? '';

  const updateNote = (id: string, note: string) => {
    setTransactions(prev => prev.map(tx =>
      tx.id === id
        ? {
            ...tx,
            note,
            status: tx.amount < 0
              ? (note.trim() ? 'evidenced' : 'needs_note')
              : tx.status,
          }
        : tx
    ));
  };

  const simulateFileUpload = (id: string) => {
    const name = `receipt_${id.slice(-2)}.pdf`;
    setTransactions(prev => prev.map(tx =>
      tx.id === id ? { ...tx, files: [...tx.files, name] } : tx
    ));
  };

  const handleSave = () => {
    onSave?.(transactions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Topbar initials="JD" userName="Jane" />
        <main className="page-content">
          <p style={{ color: 'var(--color-ink-muted)', marginTop: '2rem' }}>Loading transactions…</p>
        </main>
      </div>
    );
  }

  const needsNoteCount = transactions.filter(tx => tx.status === 'needs_note').length;

  return (
    <div className="page-shell">
      <Topbar initials="JD" userName="Jane" />

      <main className="page-content">
        <button className="back-link" onClick={onBack}>
          ← {displayName}
        </button>

        <div className="page-header fade-up">
          <h1>Edit transactions</h1>
          <p>
            Add notes and evidence to each transaction to keep donors informed.
            {needsNoteCount > 0 && (
              <span style={{ color: 'var(--color-glass-amber)', marginLeft: 8 }}>
                {needsNoteCount} transaction{needsNoteCount > 1 ? 's' : ''} still need{needsNoteCount === 1 ? 's' : ''} a note.
              </span>
            )}
          </p>
        </div>

        {/* Account info pill */}
        {displayBank && (
          <div className="fade-up fade-up-1" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '5px 14px',
            fontSize: 12,
            color: 'var(--color-ink-mid)',
            marginBottom: '1.25rem',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-glass-teal)', display: 'inline-block' }} />
            {displayBank}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {transactions.map((tx, i) => (
            <div
              key={tx.id}
              className={`card card-pad fade-up fade-up-${Math.min(i + 2, 4)}`}
            >
              {/* Transaction header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: tx.status !== 'income' ? 12 : 0,
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 2 }}>
                    {tx.description}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{tx.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: 15,
                    fontWeight: 500,
                    marginBottom: 4,
                    color: tx.amount < 0 ? 'var(--color-glass-red)' : 'var(--color-glass-green)',
                  }}>
                    {tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <span className={statusConfig[tx.status].className}>
                    {statusConfig[tx.status].label}
                  </span>
                </div>
              </div>

              {/* Note + evidence — only for debits */}
              {tx.status !== 'income' && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                  <div className="field" style={{ marginBottom: 10 }}>
                    <label>Note for donors</label>
                    <input
                      type="text"
                      placeholder="Describe what this was for..."
                      value={tx.note}
                      onChange={e => updateNote(tx.id, e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {tx.files.map(file => (
                      <div key={file} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 10px',
                        fontSize: 12,
                        color: 'var(--color-ink-mid)',
                      }}>
                        <FileIcon />{file}
                      </div>
                    ))}
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 12,
                        color: 'var(--color-glass-blue)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      onClick={() => simulateFileUpload(tx.id)}
                    >
                      + Add file or photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-full fade-up"
          style={{ marginTop: '1.5rem', padding: '0.875rem' }}
          onClick={handleSave}
        >
          {saved ? '✓ Saved' : 'Save changes'}
        </button>
      </main>
    </div>
  );
};

export default EditTrackerPage;