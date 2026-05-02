import React, { useState, useEffect } from 'react';
import {
  fetchFundraisers,
  fetchTransactions,
  ApiFundraiser,
  ApiTransaction,
} from '../services/api';

interface DonorViewPageProps {
  userEmail?: string;
}

const FileIcon = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
    <path d="M3 12V2.5L7 1h4v11H3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M7 1v3H3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M6 8l1.5 1.5L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Header = () => (
  <header style={{
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0 2rem',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }}>
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--color-glass-blue-lt)',
      borderRadius: 20,
      padding: '3px 10px 3px 6px',
    }}>
      <span style={{ color: 'var(--color-glass-blue)' }}><ShieldCheckIcon /></span>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-glass-blue)' }}>
        Verified by Glasshouse
      </span>
    </div>
  </header>
);

// ── List view ─────────────────────────────────────────────────────────────────

interface ListViewProps {
  userEmail: string;
  onSelect: (f: ApiFundraiser) => void;
}

const ListView: React.FC<ListViewProps> = ({ userEmail, onSelect }) => {
  const [fundraisers, setFundraisers] = useState<ApiFundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userEmail) return;
    fetchFundraisers(userEmail)
      .then(setFundraisers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userEmail]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="fade-up" style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
            marginBottom: 6,
          }}>
            Fundraisers
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>
            Transparent, bank-verified spending records.
          </p>
        </div>

        {loading && (
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>Loading…</p>
        )}
        {error && (
          <p style={{ fontSize: 14, color: 'var(--color-glass-red)' }}>{error}</p>
        )}
        {!loading && !error && fundraisers.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>
            No fundraisers found for this account.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fundraisers.map((f, i) => {
            const pct = f.target_amount > 0
              ? Math.min(Math.round((f.current_amount / f.target_amount) * 100), 100)
              : 0;
            return (
              <div
                key={f.fundraiserID}
                className={`card card-pad fade-up fade-up-${Math.min(i + 2, 4)}`}
                style={{ cursor: 'pointer', transition: 'box-shadow var(--transition), transform var(--transition)' }}
                onClick={() => onSelect(f)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lift)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 4 }}>
                      {f.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-ink)' }}>
                        ${f.current_amount.toLocaleString()}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>
                        of ${f.target_amount.toLocaleString()}
                      </p>
                    </div>
                    <span style={{ color: 'var(--color-ink-muted)' }}><ChevronIcon /></span>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, borderRadius: 2, background: 'var(--color-bg)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: 'var(--color-glass-teal)',
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-glass-teal)', marginTop: 4 }}>{pct}% of goal</p>
              </div>
            );
          })}
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--color-ink-muted)',
          marginTop: '2.5rem',
          lineHeight: 1.8,
        }}>
          Bank data read-only via Akahu<br />
          Powered by <strong>Glasshouse</strong> · Transparent fundraising
        </p>
      </main>
    </div>
  );
};

// ── Detail view ───────────────────────────────────────────────────────────────

interface DetailViewProps {
  fundraiser: ApiFundraiser;
  onBack: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ fundraiser, onBack }) => {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [bubble, setBubble] = useState<{ msg: string; x: number; y: number } | null>(null);

  useEffect(() => {
    fetchTransactions(fundraiser.fundraiserID)
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fundraiser.fundraiserID]);

  const showBubble = (msg: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setBubble({ msg, x: rect.left + rect.width / 2, y: rect.top });
    setTimeout(() => setBubble(null), 1500);
  };

  const totalReceived = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const remaining = totalReceived - totalSpent;

  const debits = transactions.filter(t => t.amount < 0);
  const evidencedCount = debits.filter(t => !!t.description).length;

  const filtered = transactions.filter(t => {
    if (filter === 'debit') return t.amount < 0;
    if (filter === 'credit') return t.amount > 0;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>

        <button
          className="back-link"
          onClick={onBack}
          style={{ marginBottom: '1.25rem' }}
        >
          ← All fundraisers
        </button>

        {/* Hero */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
            marginBottom: 6,
          }}>
            {fundraiser.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 8 }}>
            {fundraiser.description}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>
            Hosted by {fundraiser.email}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href).catch(() => null);
            }}
            style={{
              marginTop: 12,
              padding: '6px 16px',
              borderRadius: 20,
              border: '1px solid var(--color-glass-blue)',
              background: 'transparent',
              color: 'var(--color-glass-blue)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5.5 5.5h-1a3 3 0 000 6h1m4-6h1a3 3 0 010 6h-1m-4.5-3h5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copy public link
          </button>
        </div>

        {/* Target progress */}
        <div className="card card-pad fade-up fade-up-1" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>Fundraising goal</span>
            <span style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>
              ${totalReceived.toLocaleString()} of ${fundraiser.target_amount.toLocaleString()}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--color-bg)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${fundraiser.target_amount > 0 ? Math.min((totalReceived / fundraiser.target_amount) * 100, 100) : 0}%`,
              background: 'var(--color-glass-teal)',
              borderRadius: 3,
            }} />
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid fade-up fade-up-1" style={{ marginBottom: '1.25rem' }}>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Total received</div>
            <div className="stat-value">${totalReceived.toLocaleString()}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Total spent</div>
            <div className="stat-value">${totalSpent.toFixed(2)}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Remaining</div>
            <div className="stat-value" style={{ color: 'var(--color-glass-teal)' }}>
              ${remaining.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Evidence summary */}
        {debits.length > 0 && (
          <div className="card card-pad fade-up fade-up-2" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 3 }}>
                  Spending transparency
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                  {evidencedCount} of {debits.length} transactions evidenced
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  width: 120,
                  height: 6,
                  borderRadius: 3,
                  background: 'var(--color-bg)',
                  overflow: 'hidden',
                  marginBottom: 4,
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round((evidencedCount / Math.max(debits.length, 1)) * 100)}%`,
                    background: 'var(--color-glass-teal)',
                    borderRadius: 3,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-glass-teal)', fontWeight: 500 }}>
                  {Math.round((evidencedCount / Math.max(debits.length, 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="fade-up fade-up-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-ink)' }}>
            Transaction log
          </h2>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'debit', 'credit'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: filter === f ? 'var(--color-glass-blue)' : 'var(--color-border)',
                  background: filter === f ? 'var(--color-glass-blue)' : 'transparent',
                  color: filter === f ? 'white' : 'var(--color-ink-muted)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {f === 'all' ? 'All' : f === 'debit' ? 'Spending' : 'Donations'}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>Loading transactions…</p>
        )}

        {!loading && filtered.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>No transactions yet.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((tx, i) => {
            const isIncome = tx.amount > 0;
            const hasNote = !!tx.description;
            return (
              <div
                key={tx.transactionID}
                className={`card card-pad fade-up fade-up-${Math.min(i + 4, 4)}`}
                style={{
                  borderLeft: isIncome
                    ? undefined
                    : hasNote
                      ? '3px solid var(--color-glass-teal)'
                      : '3px solid var(--color-glass-amber)',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: !isIncome ? 10 : 0,
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 2 }}>
                      {tx.payee}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                      {tx.created_at ? tx.created_at.slice(0, 10) : ''}
                    </p>
                  </div>
                  <p style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: isIncome ? 'var(--color-glass-green)' : 'var(--color-glass-red)',
                    flexShrink: 0,
                    marginLeft: 12,
                  }}>
                    {isIncome ? '+' : '−'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>

                {!isIncome && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                    {hasNote ? (
                      <div style={{
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px',
                      }}>
                        <p style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: tx.file ? 8 : 0 }}>
                          {tx.description}
                        </p>
                        {tx.file && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '3px 9px',
                                fontSize: 11,
                                color: 'var(--color-glass-blue)',
                                cursor: 'pointer',
                              }}
                              onClick={e => showBubble(`Preview: ${tx.file} (coming soon)`, e)}
                            >
                              <FileIcon />{tx.file}
                            </div>
                            <span className="badge badge-green" style={{ fontSize: 10 }}>Evidenced</span>
                          </div>
                        )}
                        {!tx.file && (
                          <span className="badge badge-green" style={{ fontSize: 10 }}>Evidenced</span>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        background: 'var(--color-glass-amber-lt)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px',
                      }}>
                        <p style={{ fontSize: 12, color: 'var(--color-glass-amber)' }}>
                          Note pending from fundraiser host
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--color-ink-muted)',
          marginTop: '2rem',
          lineHeight: 1.8,
        }}>
          Bank data read-only via Akahu<br />
          Powered by <strong>Glasshouse</strong> · Transparent fundraising
        </p>

        {bubble && (
          <div style={{
            position: 'fixed',
            left: bubble.x,
            top: bubble.y - 8,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(26,30,36,0.9)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 12,
            fontSize: 12,
            whiteSpace: 'nowrap',
            zIndex: 10000,
            pointerEvents: 'none',
          }}>
            {bubble.msg}
            <div style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(26,30,36,0.9)',
            }} />
          </div>
        )}
      </main>
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────

const DonorViewPage: React.FC<DonorViewPageProps> = ({ userEmail = '' }) => {
  const [selected, setSelected] = useState<ApiFundraiser | null>(null);

  if (selected) {
    return <DetailView fundraiser={selected} onBack={() => setSelected(null)} />;
  }

  return <ListView userEmail={userEmail} onSelect={setSelected} />;
};

export default DonorViewPage;
