import React from 'react';

interface TopbarProps {
  userName?: string;
  initials?: string;
  onLogoClick?: () => void;
}

const GlasshouseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="14" height="14" rx="2.5" fill="none" stroke="white" strokeWidth="1.4" />
    <path d="M5.5 9h7M5.5 6h7M5.5 12h4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const Topbar: React.FC<TopbarProps> = ({ userName, initials, onLogoClick }) => {
  return (
    <header className="topbar">
      <div className="topbar-brand" onClick={onLogoClick} style={{ cursor: onLogoClick ? 'pointer' : 'default' }}>
        <div className="brand-icon">
          <GlasshouseIcon />
        </div>
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
