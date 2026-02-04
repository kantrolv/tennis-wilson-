import React from 'react';

const CheckoutDemo = ({ product, onClose, onConfirm }) => {
    if (!product) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="glass-panel" style={{
                width: '90%',
                maxWidth: '500px',
                textAlign: 'center',
                backgroundColor: 'rgba(5, 16, 37, 0.95)',
                border: '1px solid var(--c-accent)'
            }}>
                <h3 className="text-hero" style={{ fontSize: '2rem', marginTop: 0 }}>Confirm Order</h3>

                <div style={{ margin: '2rem 0', textAlign: 'left', padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                    <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Product:</span>
                        <span style={{ fontWeight: 600 }}>{product.name}</span>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-accent)' }}>
                        <span>Total:</span>
                        <span style={{ fontWeight: 600 }}>${product.price}</span>
                    </p>
                </div>

                <p style={{ fontSize: '0.9rem', marginBottom: '2rem', color: 'var(--c-grey-medium)' }}>
                    This is a demo checkout. No payment will be processed.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            color: 'var(--c-ivory)',
                            border: '1px solid var(--c-grey-medium)',
                            padding: '1rem 2rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}
                    >
                        Cancel
                    </button>
                    <button className="btn-primary" style={{ marginTop: 0 }} onClick={onConfirm}>
                        Confirm Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutDemo;
