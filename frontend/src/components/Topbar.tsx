import React from 'react';
import Logo from '../logo/logo';

interface TopbarProps {
  userName?: string;
  initials?: string;
  onLogoClick?: () => void;
  onLogout?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ userName, initials, onLogoClick, onLogout }) => {
  return (
    <header className="topbar">
      <div className="topbar-brand" onClick={onLogoClick} style={{ cursor: onLogoClick ? 'pointer' : 'default' }}>
        <Logo />
        <span className="brand-name">Glasshouse</span>
      </div>
      {initials && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {userName && (
            <span style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>{userName}</span>
          )}
          <div className="avatar">{initials}</div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out"
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                fontSize: 12,
                color: 'var(--color-ink-muted)',
                cursor: 'pointer',
                transition: 'color var(--transition)',
                marginLeft: 4,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-glass-red)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-muted)')}
            >
              Log out
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Topbar;
