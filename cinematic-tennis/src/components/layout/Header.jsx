import React from 'react';
import { Link } from 'react-router-dom';
import RegionSelector from '../ui/RegionSelector';

import { useCart } from '../../context/CartContext';

const Header = () => {
  const { cartCount, setIsCartOpen } = useCart();

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
          <Link to="/" style={{
            textDecoration: 'none',
            color: 'inherit',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Home
          </Link>
          <Link to="/rackets" style={{
            textDecoration: 'none',
            color: 'inherit',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Rackets
          </Link>
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
        <div
          className="cart-icon"
          onClick={() => setIsCartOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>Cart ({cartCount})</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
