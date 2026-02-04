import React from 'react';
import RegionSelector from '../ui/RegionSelector';

const Header = () => {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: 'var(--header-height)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 4vw',
      zIndex: 100,
      mixBlendMode: 'difference',
      color: 'var(--c-ivory)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <div className="logo" style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '0.1em'
        }}>
          WILSON
        </div>

        <nav style={{ display: 'flex', gap: '2rem' }}>
          {['Rackets', 'Strings', 'Equipment', 'Custom'].map(item => (
            <a key={item} href="#" style={{
              textDecoration: 'none',
              color: 'inherit',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <RegionSelector />
        <a href="/auth" style={{
          textDecoration: 'none',
          color: 'inherit',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          border: '1px solid currentColor',
          padding: '0.5rem 1rem',
          borderRadius: '2rem'
        }}>
          Login
        </a>
        <div className="cart-icon">
          <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>Cart (0)</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
