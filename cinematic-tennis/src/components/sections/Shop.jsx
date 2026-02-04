import React, { useState } from 'react';
import { useRegion } from '../../context/RegionContext';

const Shop = ({ onCheckout }) => {
    const { region } = useRegion();

    const products = [
        { id: 1, name: 'Blade 98 16x19 v9', price: 299, image: '🏸', category: 'Adults' },
        { id: 2, name: 'Blade 100L v9', price: 279, image: '🏸', category: 'Adults' },
        { id: 3, name: 'Blade 26 v9', price: 140, image: '🧸', category: 'Kids' },
        { id: 4, name: 'Pro Staff 97 v14', price: 319, image: '🏸', category: 'Adults' },
    ];

    const [filter, setFilter] = useState('All');

    const filteredProducts = filter === 'All'
        ? products
        : products.filter(p => p.category === filter);

    return (
        <section className="section align-center" style={{ backgroundColor: '#050a14' }}>
            <h2 className="text-hero">Choose Your Weapon.</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', justifyContent: 'center' }}>
                {['All', 'Adults', 'Kids'].map(cat => (
                    <button key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            background: filter === cat ? 'var(--c-accent)' : 'transparent',
                            color: filter === cat ? 'var(--c-charcoal)' : 'var(--c-ivory)',
                            border: '1px solid var(--c-accent)',
                            padding: '0.5rem 1.5rem',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            letterSpacing: '0.1em',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {filteredProducts.map((product) => (
                    <div key={product.id} className="glass-panel" style={{
                        textAlign: 'center',
                        transition: 'transform 0.3s ease'
                    }}>
                        <div style={{
                            height: '250px',
                            background: 'rgba(255,255,255,0.05)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4rem'
                        }}>
                            {product.image}
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.name}</h4>
                        <p style={{ color: 'var(--c-accent)', marginBottom: '1.5rem', fontWeight: 600 }}>
                            {region.currencySymbol}{Math.round(product.price * region.multiplier)}
                        </p>
                        <button className="btn-primary"
                            style={{ marginTop: 0, width: '100%', fontSize: '0.8rem' }}
                            onClick={() => onCheckout(product)}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Shop;
