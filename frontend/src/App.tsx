import React, { useState } from 'react';
import './styles/globals.css';

import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import CreateFundraiserPage from './pages/CreateFundraiserPage';
import EditTrackerPage from './pages/EditTrackerPage';
import DonorViewPage from './pages/DonorViewPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

type Page = 'auth' | 'account' | 'create' | 'edit' | 'donor' | 'forgot';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('auth');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState('');

  const handleLogin = () => {
    setIsLoggedIn(true);
    setPage('account');
  };

  const handleSignup = () => {
    setIsLoggedIn(true);
    setPage('account');
  };

  const handleForgotPassword = () => {
    setPage('forgot');
  };

  const handleForgotBack = (email?: string) => {
    if (email) setPrefillEmail(email);
    setPage('auth');
  };

  // Simple demo nav — replace with React Router in production
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
          userName="Jane"
          initials="JD"
          onViewFundraiser={() => setPage('edit')}
          onCreateNew={() => setPage('create')}
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
