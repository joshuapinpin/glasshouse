import React, { useState, useEffect } from 'react';
import './styles/globals.css';

import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import { Fundraiser } from './pages/AccountPage';
import CreateFundraiserPage from './pages/CreateFundraiserPage';
import EditTrackerPage from './pages/EditTrackerPage';
import DonorViewPage from './pages/DonorViewPage';
import { fetchFundraisers, ApiFundraiserSummary } from './services/api';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

type Page = 'auth' | 'account' | 'create' | 'edit' | 'donor' | 'forgot';

function getInitials(email: string): string {
  return email.split('@')[0].slice(0, 2).toUpperCase();
}

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('auth');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiFundraisers, setApiFundraisers] = useState<ApiFundraiserSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (page === 'account') {
      fetchFundraisers().then(setApiFundraisers).catch(console.error);
    }
  }, [page]);

  const fundraisers: Fundraiser[] = apiFundraisers.map(f => ({
    id: f.id,
    name: f.Name,
    bank: '',
    accountMasked: '',
    transactionCount: 0,
    totalRaised: f.CurrentAmount,
    status: 'active',
  }));
  const [prefillEmail, setPrefillEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Login failed');
      }
      const data = await res.json();
      // Store user info from response
      const name = data.user?.email?.split('@')[0] || email.split('@')[0];
      setUserName(name);
      setUserInitials(getInitials(email));
      setIsLoggedIn(true);
      setPage('account');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Signup failed');
      }
      const data = await res.json();
      const displayName = name || email.split('@')[0];
      setUserName(displayName);
      setUserInitials(getInitials(email));
      setIsLoggedIn(true);
      setPage('account');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/auth/signout', { method: 'POST' });
    } catch (_) {
      // Silently handle — still navigate back even if API fails
    }
    setIsLoggedIn(false);
    setUserName('');
    setUserInitials('');
    setPage('auth');
  };

  const handleForgotPassword = () => {
    setPage('forgot');
  };

  const handleForgotBack = (email?: string) => {
    if (email) setPrefillEmail(email);
    setPage('auth');
  };
  return (
    <>
      {/* Demo page switcher bar (remove in production) */}
      <div style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(26,30,36,0.9)',
        backdropFilter: 'blur(8px)',
        borderRadius: 40,
        padding: '6px 10px',
        display: 'flex',
        gap: 4,
        zIndex: 9999,
      }}>
        {([
          ['auth',    'Login'],
          ['account', 'Dashboard'],
          ['create',  'Create'],
          ['edit',    'Edit'],
          ['donor',   'Donor view'],
        ] as [Page, string][]).map(([p, label]) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: 'none',
              background: page === p ? 'white' : 'transparent',
              color: page === p ? '#1A1E24' : 'rgba(255,255,255,0.65)',
              fontSize: 12,
              fontWeight: page === p ? 500 : 400,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 180ms ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pages */}
            {page === 'auth' && (
        <AuthPage
          onLogin={handleLogin}
          onSignup={handleSignup}
          onForgotPassword={handleForgotPassword}
          prefillEmail={prefillEmail}
        />
      )}
            {page === 'account' && (
        <AccountPage
          userName={userName}
          initials={userInitials}
          onViewFundraiser={() => setPage('edit')}
          userName="Jane"
          initials="JD"
          fundraisers={fundraisers}
          onViewFundraiser={(id) => {
            setSelectedId(id);
            setPage('edit');
          }}
          onCreateNew={() => setPage('create')}
          onLogout={handleLogout}
        />
      )}
      {page === 'create' && (
        <CreateFundraiserPage
          onBack={() => setPage('account')}
          onComplete={() => setPage('account')}
        />
      )}
      {page === 'edit' && (
        <EditTrackerPage
          fundraiserId={selectedId ?? ''}
          onBack={() => setPage('account')}
        />
      )}
            {page === 'donor' && (
        <DonorViewPage />
      )}
      {page === 'forgot' && (
        <ForgotPasswordPage
          onBack={handleForgotBack}
        />
      )}
    </>
  );
};

export default App;