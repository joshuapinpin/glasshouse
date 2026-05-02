import React, { useState } from 'react';
import Topbar from '../components/Topbar';

interface CreateFundraiserPageProps {
  onBack?: () => void;
  onComplete?: (data: FundraiserData) => void;
}

interface FundraiserData {
  name: string;
  description: string;
  externalLink: string;
  bankConnected: boolean;
}

const steps = ['Details', 'Link bank', 'Review'];

const AkahuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="16" height="16" rx="4" fill="#1A4F8A" />
    <path d="M5 13l3.5-8 3.5 8M6.5 10h5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CreateFundraiserPage: React.FC<CreateFundraiserPageProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FundraiserData>({
    name: '',
    description: '',
    externalLink: '',
    bankConnected: false,
  });

  const update = (field: keyof FundraiserData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setData(prev => ({ ...prev, [field]: e.target.value }));

  const connectBank = () => {
    // Simulate Akahu OAuth
    setTimeout(() => {
      setData(prev => ({ ...prev, bankConnected: true }));
    }, 1200);
  };

  return (
    <div className="page-shell">
      <Topbar initials="JD" userName="Jane" onLogoClick={onBack} />

      <main className="page-content">
        <button className="back-link" onClick={onBack}>
          ← My fundraisers
        </button>

        <div className="page-header fade-up">
          <h1>Create a new fundraiser</h1>
          <p>Fill in the details and link a dedicated bank account to get started.</p>
        </div>

        {/* Step indicator */}
        <div className="card card-pad fade-up fade-up-1" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {steps.map((label, i) => (
              <React.Fragment key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: i < step
                      ? 'var(--color-glass-teal)'
                      : i === step
                        ? 'var(--color-glass-blue)'
                        : 'var(--color-bg)',
                    border: i > step ? '1.5px solid var(--color-border-md)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: i <= step ? 'white' : 'var(--color-ink-muted)',
                    fontSize: 12,
                    fontWeight: 500,
                    flexShrink: 0,
                    transition: 'all var(--transition)',
                  }}>
                    {i < step ? <CheckIcon /> : i + 1}
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: i === step ? 500 : 400,
                    color: i === step ? 'var(--color-glass-blue)' : 'var(--color-ink-muted)',
                  }}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 1,
                    background: i < step ? 'var(--color-glass-teal)' : 'var(--color-border)',
                    margin: '0 12px',
                    transition: 'background var(--transition)',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 0: Details */}
        {step === 0 && (
          <div className="card card-pad fade-up fade-up-2">
            <form
              onSubmit={e => { e.preventDefault(); setStep(1); }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div className="field">
                <label>Fundraiser name</label>
                <input
                  type="text"
                  placeholder="e.g. Medical fund for Mum"
                  value={data.name}
                  onChange={update('name')}
                  required
                />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  placeholder="Describe the cause and how funds will be used..."
                  value={data.description}
                  onChange={update('description')}
                  rows={4}
                  required
                />
              </div>
              <div className="field">
                <label>GoFundMe / external link <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--color-ink-muted)' }}>(optional)</span></label>
                <input
                  type="url"
                  placeholder="https://gofundme.com/..."
                  value={data.externalLink}
                  onChange={update('externalLink')}
                />
              </div>
              <div style={{
                background: 'var(--color-glass-blue-lt)',
                border: '1px solid rgba(46, 111, 187, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
                fontSize: 13,
                color: 'var(--color-glass-blue)',
              }}>
                <strong style={{ display: 'block', marginBottom: 3, color: 'var(--color-glass-blue)', fontWeight: 500 }}>
                  Next: link your bank account via Akahu
                </strong>
                You'll securely connect a dedicated account so Glasshouse can display your transactions to donors. Read-only access only.
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ padding: '0.75rem' }}>
                Save and continue →
              </button>
            </form>
          </div>
        )}

        {/* Step 1: Link bank */}
        {step === 1 && (
          <div className="card card-pad fade-up fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6, color: 'var(--color-ink)' }}>
                Link your bank account
              </h2>
              <p style={{ fontSize: 14, color: 'var(--color-ink-mid)' }}>
                Glasshouse uses Akahu to securely connect to your bank. We only request read-only access to the account you choose.
              </p>
            </div>

            {/* Bank list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['ANZ', 'Westpac', 'ASB', 'BNZ', 'Kiwibank'].map(bank => (
                <div
                  key={bank}
                  style={{
                    padding: '0.875rem 1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    color: 'var(--color-ink)',
                    opacity: data.bankConnected ? 0.5 : 1,
                  }}
                >
                  <span>{bank}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>NZ</span>
                </div>
              ))}
            </div>

            {data.bankConnected ? (
              <div style={{
                background: 'var(--color-glass-green-lt)',
                border: '1px solid rgba(39, 96, 39, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ color: 'var(--color-glass-green)' }}><CheckIcon /></span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-glass-green)', marginBottom: 2 }}>
                    ANZ ••••7821 connected
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-glass-teal)' }}>
                    Read-only access granted via Akahu
                  </p>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-full"
                style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                onClick={connectBank}
              >
                <AkahuIcon />
                Connect via Akahu
              </button>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(0)}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2, padding: '0.75rem' }}
                disabled={!data.bankConnected}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="card card-pad fade-up fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-ink)' }}>
              Review and launch
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Fundraiser name', value: data.name },
                { label: 'Description', value: data.description },
                { label: 'External link', value: data.externalLink || '—' },
                { label: 'Bank account', value: 'ANZ ••••7821 (read-only)' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', paddingTop: 2, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 14, color: 'var(--color-ink)', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
              By launching, you agree that transactions will be visible to anyone with the public link. You can add notes and evidence to each transaction at any time.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2, padding: '0.75rem' }}
                onClick={() => onComplete?.(data)}
              >
                Launch fundraiser
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateFundraiserPage;
