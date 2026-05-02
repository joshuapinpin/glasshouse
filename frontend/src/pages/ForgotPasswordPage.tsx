import React, { useState } from 'react';
import Logo from '../logo/logo';

type Step = 'email' | 'verify' | 'reset' | 'done';

interface ForgotPasswordPageProps {
  onBack: (email?: string) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    // Simulate sending a verification code
    const mockCode = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(mockCode);
    alert(`📧 Verification code sent to ${email}\n\n(In production this would be a real email)\n\nYour code: ${mockCode}`);
    setStep('verify');
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code !== sentCode) { setError('Invalid verification code'); return; }
    setStep('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    // Simulate saving to database
    const stored = JSON.parse(localStorage.getItem('users') || '{}');
    stored[email] = newPassword;
    localStorage.setItem('users', JSON.stringify(stored));
    setStep('done');
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
          <form onSubmit={handleSendCode} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Forgot password
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
              Enter your email and we'll send you a verification code.
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
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4, padding: '0.75rem' }}>
              Send verification code
            </button>
            <button type="button" onClick={() => onBack()} style={{
              background: 'none', border: 'none', color: 'var(--color-glass-blue)',
              fontSize: 13, cursor: 'pointer', padding: '4px 0',
            }}>
              ← Back to login
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Check your email
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
              We sent a verification code to <strong>{email}</strong>.
            </p>
            <div className="field">
              <label>Verification code</label>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            {error && <p style={{ fontSize: 12, color: 'var(--color-glass-red)' }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4, padding: '0.75rem' }}>
              Verify code
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep('email')} style={{
                background: 'none', border: 'none', color: 'var(--color-glass-blue)',
                fontSize: 13, cursor: 'pointer', padding: '4px 0',
              }}>
                ← Change email
              </button>
              <button type="button" onClick={() => { setSentCode(String(Math.floor(100000 + Math.random() * 900000))); alert(`New code sent! Your code: ${sentCode}`); }} style={{
                background: 'none', border: 'none', color: 'var(--color-glass-blue)',
                fontSize: 13, cursor: 'pointer', padding: '4px 0',
              }}>
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Reset password
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
              Enter your new password for <strong>{email}</strong>.
            </p>
            <div className="field">
              <label>New password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            {error && <p style={{ fontSize: 12, color: 'var(--color-glass-red)' }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4, padding: '0.75rem' }}>
              Reset password
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
              Password reset successful
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>
              Your password has been updated. You can now log in with your new password.
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
