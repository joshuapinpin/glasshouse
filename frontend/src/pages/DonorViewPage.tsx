import React, { useState } from 'react';

export interface DonorTransaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  note?: string;
  files?: string[];
  evidenced: boolean;
  isIncome: boolean;
}

interface DonorViewPageProps {
  fundraiserName?: string;
  hostedBy?: string;
  bank?: string;
  totalReceived?: number;
  totalSpent?: number;
  transactions?: DonorTransaction[];
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

const defaultTransactions: DonorTransaction[] = [
  {
    id: 'tx1',
    description: 'Auckland City Hospital',
    date: '14 Apr 2025',
    amount: -1240,
    note: 'Specialist consultation and imaging — invoice attached',
    files: ['invoice_apr14.pdf'],
    evidenced: true,
    isIncome: false,
  },
  {
    id: 'tx2',
    description: 'Pharmacy Direct',
    date: '18 Apr 2025',
    amount: -87.50,
    evidenced: false,
    isIncome: false,
  },
  {
    id: 'tx3',
    description: 'Donation received',
    date: '20 Apr 2025',
    amount: 500,
    evidenced: true,
    isIncome: true,
  },
  {
    id: 'tx4',
    description: 'Radiology NZ',
    date: '22 Apr 2025',
    amount: -320,
    note: 'MRI scan for diagnosis — receipt pending upload',
    evidenced: false,
    isIncome: false,
  },
  {
    id: 'tx5',
    description: 'Donation received',
    date: '25 Apr 2025',
    amount: 750,
    evidenced: true,
    isIncome: true,
  },
];

const DonorViewPage: React.FC<DonorViewPageProps> = ({
  fundraiserName = 'Medical fund for Mum',
  hostedBy = 'Jane Doe',
  bank = 'ANZ ••••7821',
  totalReceived = 5200,
  totalSpent = 1327,
  transactions = defaultTransactions,
}) => {
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
    const [bubble, setBubble] = useState<{ msg: string; x: number; y: number } | null>(null);

  const showBubble = (msg: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setBubble({
      msg,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setTimeout(() => setBubble(null), 1500);
  };
  const remaining = totalReceived - totalSpent;

  const filtered = transactions.filter(tx => {
    if (filter === 'debit') return !tx.isIncome;
    if (filter === 'credit') return tx.isIncome;
    return true;
  });

  const evidencedCount = transactions.filter(tx => !tx.isIncome && tx.evidenced).length;
  const debitCount = transactions.filter(tx => !tx.isIncome).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Slim header */}
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

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Hero */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
            marginBottom: 8,
          }}>
            {fundraiserName}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>
            Raised by {hostedBy} · {bank}
          </p>
                    {/* Share button */}
          <button
            onClick={() => alert('Public link copied to clipboard')}
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
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-glass-blue-lt)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5.5 5.5h-1a3 3 0 000 6h1m4-6h1a3 3 0 010 6h-1m-4.5-3h5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copy public link
          </button>
        </div>

        {/* Stats */}
        <div className="stat-grid fade-up fade-up-1">
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Total received</div>
            <div className="stat-value">${totalReceived.toLocaleString()}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Total spent</div>
            <div className="stat-value">${totalSpent.toLocaleString()}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Remaining</div>
            <div className="stat-value" style={{ color: 'var(--color-glass-teal)' }}>
              ${remaining.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Evidence summary */}
        <div className="card card-pad fade-up fade-up-2" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 3 }}>
                Spending transparency
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                {evidencedCount} of {debitCount} transactions evidenced
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
                  width: `${Math.round((evidencedCount / Math.max(debitCount, 1)) * 100)}%`,
                  background: 'var(--color-glass-teal)',
                  borderRadius: 3,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-glass-teal)', fontWeight: 500 }}>
                {Math.round((evidencedCount / Math.max(debitCount, 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>

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

        {/* Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((tx, i) => (
            <div key={tx.id} className={`card card-pad fade-up fade-up-${Math.min(i + 4, 4)}`}>
              {/* Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tx.note || !tx.evidenced && !tx.isIncome ? 10 : 0 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 2 }}>
                    {tx.description}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{tx.date}</p>
                </div>
                <p style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: tx.amount < 0 ? 'var(--color-glass-red)' : 'var(--color-glass-green)',
                  flexShrink: 0,
                  marginLeft: 12,
                }}>
                  {tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)}
                </p>
              </div>

              {/* Note/evidence block */}
              {!tx.isIncome && (
                <div style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 10,
                }}>
                  {tx.evidenced && tx.note ? (
                    <div style={{
                      background: 'var(--color-bg)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                    }}>
                      <p style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: tx.files?.length ? 8 : 0 }}>
                        {tx.note}
                      </p>
                      {tx.files && tx.files.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {tx.files.map(f => (
                            <div key={f} style={{
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
                            onClick={
                              (e)=> showBubble(`Preview: ${f} (coming soon)`,e)
                            }>
                              <FileIcon />{f}
                            </div>
                          ))}
                          <span className="badge badge-green" style={{ fontSize: 10 }}>Evidenced</span>
                        </div>
                      )}
                    </div>
                  ) : tx.note ? (
                    <div style={{
                      background: 'var(--color-glass-amber-lt)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                    }}>
                      <p style={{ fontSize: 13, color: 'var(--color-glass-amber)', marginBottom: 4 }}>
                        {tx.note}
                      </p>
                      <span className="badge badge-amber" style={{ fontSize: 10 }}>Receipt pending</span>
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
          ))}
        </div>

        {/* Footer */}
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
            {/* 向下的小三角箭头 */}
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

export default DonorViewPage;
