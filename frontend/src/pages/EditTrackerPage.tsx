import React, { useState, useEffect, useRef } from 'react';
import Topbar from '../components/Topbar';
import {
  fetchFundraiser,
  fetchTransactions,
  syncTransactions,
  updateTransactionDescription,
  uploadTransactionFile,
  refreshBank,
  ApiFundraiser,
} from '../services/api';

export type EvidenceStatus = 'evidenced' | 'needs_note' | 'income';

export interface Transaction {
  id: string;
  transactionId: number;
  description: string;
  date: string;
  amount: number; // negative = debit, positive = credit
  note: string;
  files: string[];
  status: EvidenceStatus;
}

interface EditTrackerPageProps {
  fundraiserId: number;
  userEmail: string;
  userInitials: string;
  onBack?: () => void;
  onSave?: (transactions: Transaction[]) => void;
}


const fileUrl = (path: string) => `/uploads/${path.split('/').pop()}`;

const formatNZDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NZ', {
    timeZone: 'Pacific/Auckland',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const statusConfig: Record<EvidenceStatus, { label: string; className: string }> = {
  evidenced:  { label: 'Evidenced',   className: 'badge badge-green' },
  needs_note: { label: 'Needs note',  className: 'badge badge-amber' },
  income:     { label: 'Income',      className: 'badge badge-gray'  },
};

function mapTransactions(raw: Awaited<ReturnType<typeof fetchTransactions>>): Transaction[] {
  return [...raw]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(t => ({
    id: String(t.transactionID),
    transactionId: t.transactionID,
    description: t.payee,
    date: t.created_at ? formatNZDate(t.created_at) : '',
    amount: t.amount,
    note: t.description ?? '',
    files: t.file ? [t.file] : [],
    status: t.amount > 0 ? 'income' : (t.description ? 'evidenced' : 'needs_note'),
  }));
}

const EditTrackerPage: React.FC<EditTrackerPageProps> = ({
  fundraiserId,
  userEmail,
  userInitials,
  onBack,
  onSave,
}) => {
  const [fundraiser, setFundraiser] = useState<ApiFundraiser | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!fundraiserId) return;
    setLoading(true);
    // Sync from Akahu first, then load whatever is in the DB
    syncTransactions(fundraiserId)
      .catch(() => null) // don't block display if sync fails
      .then(() => Promise.all([
        fetchFundraiser(fundraiserId).catch(() => null),
        fetchTransactions(fundraiserId),
      ]))
      .then(([f, txns]) => {
        setFundraiser(f);
        setTransactions(mapTransactions(txns));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fundraiserId]);

  const updateNote = (id: string, note: string) => {
    setTransactions(prev => prev.map(tx =>
      tx.id === id
        ? { ...tx, note, status: tx.amount < 0 ? (note.trim() ? 'evidenced' : 'needs_note') : tx.status }
        : tx
    ));
  };

  const removeFile = (txId: string, fileName: string) => {
    setTransactions(prev => prev.map(tx =>
      tx.id === txId ? { ...tx, files: tx.files.filter(f => f !== fileName) } : tx
    ));
  };

  const simulateFileUpload = (id: string) => {
    setTransactions(prev => prev.map(tx =>
      tx.id === id ? { ...tx, files: [...tx.files, `receipt_${id.slice(-4)}.pdf`] } : tx
    ));
  };

  const triggerUpload = (id: string) => {
    setUploadingId(id);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    const tx = transactions.find(t => t.id === uploadingId);
    if (!tx) return;
    try {
      const filename = await uploadTransactionFile(tx.transactionId, file);
      setTransactions(prev => prev.map(t =>
        t.id === uploadingId ? { ...t, files: [filename] } : t
      ));
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await refreshBank();
      await new Promise(r => setTimeout(r, 3000));
      const { synced } = await syncTransactions(fundraiserId);
      const txns = await fetchTransactions(fundraiserId);
      setTransactions(mapTransactions(txns));
      setSyncMsg(`${synced} transaction${synced !== 1 ? 's' : ''} synced from Akahu`);
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      await Promise.all(
        transactions
          .filter(tx => tx.amount < 0)
          .map(tx => updateTransactionDescription(tx.transactionId, tx.note))
      );
      onSave?.(transactions);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const displayName = fundraiser?.name ?? 'Fundraiser';
  const needsNoteCount = transactions.filter(tx => tx.status === 'needs_note').length;

  if (loading) {
    return (
      <div className="page-shell">
        <Topbar initials={userInitials} userName={userEmail} />
        <main className="page-content">
          <p style={{ color: 'var(--color-ink-muted)', marginTop: '2rem' }}>Loading transactions…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Topbar initials={userInitials} userName={userEmail} />

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

        {/* Fundraiser meta */}
        {fundraiser && (
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
            marginBottom: '0.75rem',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-glass-teal)', display: 'inline-block' }} />
            Westpac · target ${fundraiser.target_amount.toLocaleString()} · raised ${fundraiser.current_amount.toLocaleString()}
          </div>
        )}

        {/* Sync row */}
        <div className="fade-up fade-up-1" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '5px 14px',
              fontSize: 12,
              color: 'var(--color-glass-blue)',
              cursor: syncing ? 'default' : 'pointer',
            }}
          >
            {syncing ? 'Syncing…' : '↻ Sync from Akahu'}
          </button>
          {syncMsg && (
            <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{syncMsg}</span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {transactions.length === 0 && (
          <p style={{ color: 'var(--color-ink-muted)', fontSize: 14 }}>
            No transactions yet — click Sync from Akahu to pull the latest.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {transactions.map((tx, i) => (
            <div
              key={tx.id}
              className={`card card-pad fade-up fade-up-${Math.min(i + 2, 4)}`}
              style={{
                borderLeft: tx.status === 'needs_note'
                  ? '3px solid var(--color-glass-amber)'
                  : tx.status === 'evidenced'
                    ? '3px solid var(--color-glass-teal)'
                    : undefined,
              }}
            >
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

              {tx.status !== 'income' && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                  <div className="field" style={{ marginBottom: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      Note for donors
                      {tx.note.trim()
                        ? <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-glass-teal)' }}>✓ Added</span>
                        : <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-glass-amber)' }}>Required</span>
                      }
                    </label>
                    <input
                      type="text"
                      placeholder="Describe what this was for..."
                      value={tx.note}
                      onChange={e => updateNote(tx.id, e.target.value)}
                      style={tx.note.trim() ? {
                        borderColor: 'var(--color-glass-teal)',
                        background: 'var(--color-glass-green-lt)',
                      } : {
                        borderColor: 'var(--color-glass-amber)',
                      }}
                    />
                  </div>
                  {tx.files.map(file => (
                    <img
                      key={file}
                      src={fileUrl(file)}
                      alt={file}
                      style={{
                        maxWidth: '100%',
                        maxHeight: 220,
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        display: 'block',
                        marginBottom: 8,
                      }}
                    />
                  ))}
                  <button
                    style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--color-glass-blue)', cursor: uploadingId === tx.id ? 'default' : 'pointer', padding: 0 }}
                    onClick={() => triggerUpload(tx.id)}
                    disabled={uploadingId === tx.id}
                  >
                    {uploadingId === tx.id ? 'Uploading…' : tx.files.length > 0 ? '↺ Replace image' : '+ Add image'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {saveError && (
          <p style={{ fontSize: 13, color: 'var(--color-glass-red)', marginTop: '1rem' }}>{saveError}</p>
        )}

        <button
          className="btn btn-primary btn-full fade-up"
          style={{ marginTop: '1.5rem', padding: '0.875rem' }}
          onClick={handleSave}
          disabled={saving || transactions.length === 0}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </main>
    </div>
  );
};

export default EditTrackerPage;
