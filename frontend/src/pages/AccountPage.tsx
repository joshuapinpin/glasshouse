import React from 'react';
import Topbar from '../components/Topbar';

export interface Fundraiser {
  id: string;
  name: string;
  bank: string;
  accountMasked: string;
  transactionCount: number;
  totalRaised: number;
  status: 'active' | 'closed';
}

interface AccountPageProps {
  userName?: string;
  initials?: string;
  fundraisers?: Fundraiser[];
  onViewFundraiser?: (id: string) => void;
  onCreateNew?: () => void;
}

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const defaultFundraisers: Fundraiser[] = [
  {
    id: '1',
    name: 'Medical fund for Mum',
    bank: 'ANZ',
    accountMasked: '••••7821',
    transactionCount: 8,
    totalRaised: 5200,
    status: 'active',
  },
  {
    id: '2',
    name: 'Community garden rebuild',
    bank: 'Westpac',
    accountMasked: '••••3304',
    transactionCount: 6,
    totalRaised: 3220,
    status: 'active',
  },
];

const AccountPage: React.FC<AccountPageProps> = ({
  userName = 'Jane',
  initials = 'JD',
  fundraisers = defaultFundraisers,
  onViewFundraiser,
  onCreateNew,
}) => {
  const totalRaised = fundraisers.reduce((sum, f) => sum + f.totalRaised, 0);
  const totalTx = fundraisers.reduce((sum, f) => sum + f.transactionCount, 0);

  return (
    <div className="page-shell">
      <Topbar userName={userName} initials={initials} />

      <main className="page-content">
        <div className="page-header fade-up">
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 4 }}>
            Welcome back, {userName}
          </p>
          <h1>Your fundraisers</h1>
        </div>

        {/* Stats */}
        <div className="stat-grid fade-up fade-up-1">
          <div className="stat-card">
            <div className="stat-label">Active trackers</div>
            <div className="stat-value">{fundraisers.filter(f => f.status === 'active').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total raised</div>
            <div className="stat-value">${totalRaised.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{totalTx}</div>
          </div>
        </div>

        {/* Fundraiser list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fundraisers.map((f, i) => (
            <div
              key={f.id}
              className={`card card-pad fade-up fade-up-${Math.min(i + 2, 4)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'box-shadow var(--transition), transform var(--transition)',
              }}
              onClick={() => onViewFundraiser?.(f.id)}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lift)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 3 }}>
                  {f.name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                  {f.bank} {f.accountMasked} · {f.transactionCount} transactions
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  {f.status === 'active' && (
                    <div className="badge badge-green" style={{ marginBottom: 4 }}>Active</div>
                  )}
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-ink)' }}>
                    ${f.totalRaised.toLocaleString()}
                  </p>
                </div>
                <span style={{ color: 'var(--color-ink-muted)' }}><ChevronIcon /></span>
              </div>
            </div>
          ))}

          {/* Create new */}
          <button
            className="fade-up fade-up-4"
            onClick={onCreateNew}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: '1.5px dashed var(--color-border-md)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 14,
              color: 'var(--color-ink-muted)',
              cursor: 'pointer',
              transition: 'background var(--transition), color var(--transition)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-glass-blue)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-ink-muted)';
            }}
          >
            <PlusIcon />
            Create new fundraiser
          </button>
        </div>
      </main>
    </div>
  );
};

export default AccountPage;
