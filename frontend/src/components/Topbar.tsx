import React from 'react';
import Logo from '../logo/logo';

interface TopbarProps {
  userName?: string;
  initials?: string;
  onLogoClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ userName, initials, onLogoClick }) => {
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
        </div>
      )}
    </header>
  );
};

export default Topbar;
