import React, { useState, useEffect } from 'react';
import './styles/globals.css';

import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import { Fundraiser } from './pages/AccountPage';
import CreateFundraiserPage from './pages/CreateFundraiserPage';
import EditTrackerPage from './pages/EditTrackerPage';
import DonorViewPage from './pages/DonorViewPage';
import { fetchFundraisers, ApiFundraiser } from './services/api';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

type Page = 'auth' | 'account' | 'create' | 'edit' | 'donor' | 'forgot';

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('auth');
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState('');
  const [apiFundraisers, setApiFundraisers] = useState<ApiFundraiser[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [prefillEmail, setPrefillEmail] = useState('');

  useEffect(() => {
    if (page === 'account' && userEmail) {
      fetchFundraisers(userEmail).then(setApiFundraisers).catch(console.error);
    }
  }, [page, userEmail]);

  const fundraisers: Fundraiser[] = apiFundraisers.map(f => ({
    id: String(f.fundraiserID),
    name: f.name,
    bank: 'Westpac',
    accountMasked: '••••7703',
    transactionCount: 0,
    totalRaised: f.current_amount,
    status: 'active',
  }));

  const userInitials = userEmail ? initialsFromEmail(userEmail) : '';

  const handleLogin = (email: string, accessToken: string) => {
    setUserEmail(email);
    setToken(accessToken);
    setPage('account');
  };

  const handleSignup = (email: string, accessToken: string) => {
    setUserEmail(email);
    setToken(accessToken);
    setPage('account');
  };

  const handleForgotPassword = () => setPage('forgot');

  const handleForgotBack = (email?: string) => {
    if (email) setPrefillEmail(email);
    setPage('auth');
  };

  return (
    <>
      {/* Demo page switcher (remove in production) */}
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
          userName={userEmail}
          initials={userInitials}
          fundraisers={fundraisers}
          onViewFundraiser={(id) => {
            setSelectedId(Number(id));
            setPage('edit');
          }}
          onCreateNew={() => setPage('create')}
        />
      )}
      {page === 'create' && (
        <CreateFundraiserPage
          userEmail={userEmail}
          onBack={() => setPage('account')}
          onComplete={() => setPage('account')}
        />
      )}
      {page === 'edit' && selectedId !== null && (
        <EditTrackerPage
          fundraiserId={selectedId}
          userEmail={userEmail}
          userInitials={userInitials}
          onBack={() => setPage('account')}
        />
      )}
      {page === 'donor' && <DonorViewPage />}
      {page === 'forgot' && (
        <ForgotPasswordPage onBack={handleForgotBack} />
      )}
    </>
  );
};

export default App;
