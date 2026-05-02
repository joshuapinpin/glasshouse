import React, { useState } from 'react';
import Logo from '../logo/logo';

type Mode = 'login' | 'signup';

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M6 8l1.5 1.5L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface AuthPageProps {
  onLogin?: (email: string, password: string) => void;
  onSignup?: (name: string, email: string, password: string) => void;
  onForgotPassword?: () => void;
  prefillEmail?: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignup, onForgotPassword, prefillEmail }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin?.(email, password);
    } else {
      onSignup?.(name, email, password);
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
        <p style={{ fontSize: 14, color: 'var(--color-ink-mid)' }}>
          Transparent fundraising, built on trust
        </p>
      </div>

      {/* Auth card */}
      <div className="card fade-up fade-up-1" style={{ width: '100%', maxWidth: 400 }}>
        {/* Tab toggle */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: 'none',
                border: 'none',
                borderBottom: mode === m ? '2px solid var(--color-glass-blue)' : '2px solid transparent',
                color: mode === m ? 'var(--color-glass-blue)' : 'var(--color-ink-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: mode === m ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 180ms ease',
                marginBottom: -1,
              }}
            >
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}
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
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: 4, padding: '0.75rem' }}
          >
            {mode === 'login' ? 'Log in to Glasshouse' : 'Create account'}
          </button>

                    {mode === 'login' && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-ink-muted)' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword?.(); }}>Forgot password?</a>
            </p>
          )}
        </form>
      </div>

      {/* Trust line */}
      <p className="fade-up fade-up-2" style={{
        marginTop: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'var(--color-ink-muted)',
      }}>
        <ShieldIcon />
        Bank data read-only via Akahu · End-to-end encrypted
      </p>
    </div>
  );
};

export default AuthPage;
