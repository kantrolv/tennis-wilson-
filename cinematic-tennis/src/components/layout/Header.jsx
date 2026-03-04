import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import AuthContext from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';


const Header = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isRacketsPage = location.pathname.startsWith('/rackets');

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  const handleRacketsClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigate('/rackets');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <header style={{
        position: isRacketsPage ? 'absolute' : 'fixed',
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
          <Link to="/" className="logo" style={{
            textDecoration: 'none',
            color: 'inherit',
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '0.1em'
          }}>
            WILSON
          </Link>

          {/* Desktop Nav */}
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
            <a href="/rackets" onClick={handleRacketsClick} style={{
              textDecoration: 'none',
              color: 'inherit',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}>
              Rackets
            </a>
            {user && (
              <Link to="/orders" style={{
                textDecoration: 'none',
                color: 'inherit',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Orders
              </Link>
            )}
            {user && (user.role === 'admin' || user.role === 'superadmin') && (
              <Link to={user.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard'} style={{
                textDecoration: 'none',
                color: 'inherit',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Desktop Right Actions */}
        <div className="header-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/profile" style={{
                textDecoration: 'none',
                color: 'inherit',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                border: '1px solid currentColor',
                padding: '0.5rem 1rem',
                borderRadius: '2rem'
              }}>
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  opacity: 0.8
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" style={{
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
            </Link>
          )}

          <div
            className="cart-icon"
            onClick={() => setIsCartOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>Cart ({cartCount})</span>
          </div>
        </div>

        {/* Mobile Right: Cart + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            onClick={() => setIsCartOpen(true)}
            style={{ cursor: 'pointer', fontSize: '0.85rem', textTransform: 'uppercase' }}
          >
            Cart ({cartCount})
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Nav Panel (full-screen overlay) */}
      <div className={`mobile-nav-panel${mobileMenuOpen ? ' open' : ''}`}>
        <button className="mobile-nav-close" onClick={closeMobile} aria-label="Close menu">
          ✕
        </button>

        <Link to="/" onClick={closeMobile}>Home</Link>
        <a href="/rackets" onClick={handleRacketsClick}>Rackets</a>

        {user && (
          <Link to="/orders" onClick={closeMobile}>Orders</Link>
        )}
        {user && (user.role === 'admin' || user.role === 'superadmin') && (
          <Link to={user.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard'} onClick={closeMobile}>
            Dashboard
          </Link>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', width: '60%', paddingTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          {user ? (
            <>
              <Link to="/profile" onClick={closeMobile} style={{ color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {user.name}
              </Link>
              <button onClick={handleLogout} style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMobile} style={{ color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(255,255,255,0.4)', padding: '0.75rem 2rem', borderRadius: '2rem' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
