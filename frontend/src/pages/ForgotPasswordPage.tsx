import React, { useState } from 'react';
import Logo from '../logo/logo';
import { resetPassword } from '../services/api';

type Step = 'email' | 'done';

interface ForgotPasswordPageProps {
  onBack: (email?: string) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
              Enter your email and we'll send you a reset link.
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
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4, padding: '0.75rem' }} disabled={loading}>
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

        {step === 'done' && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em' }}>
              Check your email
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>
              A password reset link has been sent to <strong>{email}</strong>. Follow the link in the email to set a new password.
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
