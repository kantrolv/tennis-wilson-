import React, { useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useRegion } from '../../context/RegionContext';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

const CartSidebar = () => {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartCount
    } = useCart();

    const { region } = useRegion();
    const sidebarRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isCartOpen) {
            gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.3 });
            gsap.to(sidebarRef.current, { x: '0%', duration: 0.4, ease: 'power3.out' });
        } else {
            gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3 });
            gsap.to(sidebarRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' });
        }
    }, [isCartOpen]);

    const handleClose = () => setIsCartOpen(false);

    // Format currency helper
    const fmtPrice = (price) => {
        return `${region.currencySymbol}${Math.round(price * region.multiplier).toLocaleString()}`;
    };

    return (
        <>
            {/* Overlay */}
            <div
                ref={overlayRef}
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 999,
                    opacity: 0,
                    visibility: 'hidden',
                    backdropFilter: 'blur(2px)'
                }}
            />

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: '450px',
                    height: '100%',
                    backgroundColor: '#fff',
                    zIndex: 1000,
                    transform: 'translateX(100%)',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    color: '#111'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fff'
                }}>
                    <h2 style={{
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-serif)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0
                    }}>
                        Your Cart ({cartCount})
                    </h2>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#111'
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Cart Items */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem'
                }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '4rem', color: '#666' }}>
                            <p style={{ marginBottom: '1.5rem' }}>Your cart is empty.</p>
                            <button
                                onClick={handleClose}
                                style={{
                                    borderBottom: '1px solid #111',
                                    paddingBottom: '2px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    background: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.cartId} style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #f9f9f9', paddingBottom: '2rem' }}>
                                {/* Image */}
                                <div style={{
                                    width: '80px',
                                    height: '100px',
                                    background: '#f4f4f4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} style={{ height: '80%', width: 'auto', mixBlendMode: 'multiply' }} />
                                    ) : (
                                        <span>🏸</span>
                                    )}
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, paddingRight: '1rem', lineHeight: 1.4 }}>{item.name}</h3>
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{fmtPrice(item.price * item.quantity)}</span>
                                    </div>

                                    {/* Options */}
                                    <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.6, marginBottom: '1rem' }}>
                                        {/* Grip size is always present */}
                                        <div>Grip: <span style={{ color: '#111' }}>{item.selectedGrip}</span></div>

                                        {/* String - check existence and type */}
                                        {item.selectedString && item.selectedString.id !== 'unstrung' ? (
                                            <div>String: <span style={{ color: '#111' }}>{item.selectedString.name} (+{fmtPrice(item.selectedString.price)})</span></div>
                                        ) : (
                                            <div>String: <span style={{ color: '#111' }}>Unstrung</span></div>
                                        )}

                                        {/* Cover - check existence and type */}
                                        {item.selectedCover && item.selectedCover.id !== 'none' ? (
                                            <div>Cover: <span style={{ color: '#111' }}>{item.selectedCover.name} (+{fmtPrice(item.selectedCover.price)})</span></div>
                                        ) : (
                                            <div>Cover: <span style={{ color: '#111' }}>No Cover</span></div>
                                        )}
                                    </div>

                                    {/* Controls */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0' }}>
                                            <button
                                                onClick={() => {
                                                    if (item.quantity > 1) {
                                                        updateQuantity(item.cartId, item.quantity - 1)
                                                    } else {
                                                        removeFromCart(item.cartId)
                                                    }
                                                }}
                                                style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                -
                                            </button>
                                            <span style={{ fontSize: '0.85rem', padding: '0 8px', fontWeight: 500 }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                                style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.cartId)}
                                            style={{
                                                fontSize: '0.75rem',
                                                textDecoration: 'underline',
                                                color: '#888',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div style={{ padding: '2rem', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                            <span>Total</span>
                            <span>{fmtPrice(cartTotal)}</span>
                        </div>
                        <button style={{
                            width: '100%',
                            padding: '1.2rem',
                            background: '#111',
                            color: '#fff',
                            border: 'none',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}>
                            Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
