import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRegion } from '../../context/RegionContext';

const Shop = ({ onCheckout }) => {
    const { region } = useRegion();
    const [rackets, setRackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchRackets = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/rackets');
                setRackets(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load rackets. Please ensure the backend is running.');
                setLoading(false);
            }
        };

        fetchRackets();
    }, []);

    // Extract unique models for categories
    const categories = useMemo(() => {
        const models = new Set(rackets.map(r => r.model));
        return ['All', ...Array.from(models).sort()];
    }, [rackets]);

    // Filter products
    const filteredRackets = useMemo(() => {
        return rackets.filter(racket => {
            const matchesCategory = activeCategory === 'All' || racket.model === activeCategory;
            const matchesSearch = racket.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [rackets, activeCategory, searchQuery]);

    if (loading) return (
        <section className="section align-center" style={{ backgroundColor: '#050a14', minHeight: '60vh' }}>
            <div className="text-hero">Loading Armory...</div>
        </section>
    );

    if (error) return (
        <section className="section align-center" style={{ backgroundColor: '#050a14', minHeight: '60vh' }}>
            <div style={{ color: '#ff4444' }}>{error}</div>
        </section>
    );

    return (
        <section className="section align-center" style={{ backgroundColor: '#050a14', minHeight: '100vh' }}>
            <h2 className="text-hero">Choose Your Weapon.</h2>

            {/* Controls Container */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto 3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                alignItems: 'center',
                width: '100%'
            }}>
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search for a racket..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        color: 'var(--c-ivory)',
                        fontFamily: 'var(--font-sans)',
                        width: '100%',
                        maxWidth: '500px',
                        textAlign: 'center',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />

                {/* Category Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                    {categories.map(cat => (
                        <button key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                background: activeCategory === cat ? 'var(--c-accent)' : 'transparent',
                                color: activeCategory === cat ? 'var(--c-charcoal)' : 'var(--c-ivory)',
                                border: '1px solid var(--c-accent)',
                                padding: '0.5rem 1.2rem',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-sans)',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: '0.1em',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                borderRadius: '4px'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Racket Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2.5rem',
                width: '100%',
                maxWidth: '1400px',
                padding: '0 2rem'
            }}>
                {filteredRackets.map((racket) => (
                    <div key={racket._id} className="glass-panel" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'center',
                        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        height: '100%',
                        justifyContent: 'space-between',
                        padding: '2rem'
                    }}>
                        <div>
                            <div style={{
                                height: '280px',
                                background: 'rgba(255,255,255,0.02)',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {racket.imageUrl ? (
                                    <img
                                        src={racket.imageUrl}
                                        alt={racket.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            padding: '1.5rem',
                                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
                                        }}
                                    />
                                ) : (
                                    <div style={{ fontSize: '4rem' }}>🏸</div>
                                )}
                            </div>

                            <h4 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.3rem',
                                marginBottom: '0.5rem',
                                minHeight: '3.2rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {racket.name}
                            </h4>

                            <div style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.5)',
                                marginBottom: '1.2rem',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '1rem'
                            }}>
                                <span>{racket.weight}g</span>
                                <span>•</span>
                                <span>{racket.material}</span>
                            </div>

                            <p style={{
                                color: 'var(--c-accent)',
                                marginBottom: '1.5rem',
                                fontWeight: 700,
                                fontSize: '1.4rem',
                                textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
                            }}>
                                {region.currencySymbol}{Math.round(racket.price * region.multiplier).toLocaleString()}
                            </p>
                        </div>

                        <button className="btn-primary"
                            style={{ marginTop: 'auto', width: '100%', borderRadius: '50px' }}
                            onClick={() => onCheckout(racket)}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            {filteredRackets.length === 0 && (
                <div style={{ padding: '6rem', color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}>
                    No weapons found in the armory for this selection.
                </div>
            )}
        </section>
    );
};

export default Shop;


