import React, { useState } from 'react';
import Logo from '../logo/logo';

type Step = 'email' | 'sent';

interface ForgotPasswordPageProps {
  onBack: (email?: string) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }

    setLoading(true);
    try {
      const res = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to send reset email');
      }

      setStep('sent');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Brand mark */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="fade-up">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
        }}>
          <Logo />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
          }}>Glasshouse</span>
        </div>
      </div>

      {/* Form card */}
      <div className="card fade-up fade-up-1" style={{ width: '100%', maxWidth: 420 }}>
        {step === 'email' && (
          <form onSubmit={handleSendReset} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Forgot password
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
              Enter your email and we'll send you a password reset link.
            </p>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p style={{ fontSize: 12, color: 'var(--color-glass-red)' }}>{error}</p>}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: 4, padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <button type="button" onClick={() => onBack()} style={{
              background: 'none', border: 'none', color: 'var(--color-glass-blue)',
              fontSize: 13, cursor: 'pointer', padding: '4px 0',
            }}>
              ← Back to login
            </button>
          </form>
        )}

        {step === 'sent' && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📧</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em' }}>
              Check your email
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>
              We sent a password reset link to <strong>{email}</strong>.
              Click the link in the email to reset your password.
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
              Didn't receive it?{' '}
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-glass-blue)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Send again
              </button>
            </p>
            <button
              onClick={() => onBack(email)}
              className="btn btn-primary btn-full"
              style={{ marginTop: 8, padding: '0.75rem' }}
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
