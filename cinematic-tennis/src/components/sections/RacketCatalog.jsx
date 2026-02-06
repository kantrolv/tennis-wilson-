import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useRegion } from '../../context/RegionContext';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const RacketCatalog = ({ onCheckout }) => {
    const { region } = useRegion();
    const navigate = useNavigate();
    const [rackets, setRackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Refs for animations
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const gridRef = useRef(null);
    const cardsRef = useRef([]);

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

    // Animation on Load
    useEffect(() => {
        if (!loading && rackets.length > 0) {
            const ctx = gsap.context(() => {
                // Header Entrance
                gsap.fromTo(headerRef.current.children,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
                );

                // Grid Entrance
                gsap.fromTo(".racket-card",
                    { y: 100, opacity: 0, scale: 0.95 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 0.8,
                        stagger: 0.05,
                        ease: "power2.out",
                        delay: 0.5
                    }
                );
            }, containerRef);

            return () => ctx.revert();
        }
    }, [loading, rackets]);

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

    // Hover Animation Logic
    const handleMouseEnter = (e) => {
        const card = e.currentTarget;
        const img = card.querySelector('.card-image');
        const btn = card.querySelector('.buy-btn');

        // Subtle Image Zoom
        gsap.to(img, { scale: 1.08, duration: 0.6, ease: "power2.out" });
        // Reveal Button
        gsap.to(btn, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
    };

    const handleMouseLeave = (e) => {
        const card = e.currentTarget;
        const img = card.querySelector('.card-image');
        const btn = card.querySelector('.buy-btn');

        // Reset
        gsap.to(img, { scale: 1, duration: 0.6, ease: "power2.out" });
        gsap.to(btn, { y: 20, opacity: 0, duration: 0.3 });
    };

    if (loading) return <div className="loader-container">Loading Collection...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <section ref={containerRef} style={{
            backgroundColor: '#F3F3F1', // Slight warmer grey/bone
            minHeight: '100vh',
            paddingTop: '8rem',
            paddingBottom: '8rem',
            color: '#111',
            backgroundImage: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #F3F3F1 100%)',
            fontFamily: 'var(--font-sans)'
        }}>
            <div ref={headerRef} style={{ textAlign: 'center', marginBottom: '5rem', padding: '0 2rem' }}>
                <span style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2rem',
                    marginBottom: '1rem',
                    color: '#666',
                    fontWeight: 600
                }}>
                    Official Store
                </span>
                <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(3.5rem, 6vw, 6rem)',
                    lineHeight: 0.9,
                    color: '#000',
                    margin: 0,
                    letterSpacing: '-0.03em'
                }}>
                    The Racket<br />Collection
                </h2>
            </div>

            {/* Sticky Filter Bar */}
            <div style={{
                position: 'sticky',
                top: 'var(--header-height)',
                zIndex: 90,
                background: 'rgba(243, 243, 241, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem 0',
                marginBottom: '4rem',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div className="category-scroll" style={{
                        display: 'flex',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        paddingBottom: '5px',
                        scrollbarWidth: 'none',
                        maskImage: 'linear-gradient(to right, black 90%, transparent 100%)'
                    }}>
                        {categories.map(cat => (
                            <button key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    background: activeCategory === cat ? '#111' : 'transparent',
                                    color: activeCategory === cat ? '#fff' : '#666',
                                    border: `1px solid ${activeCategory === cat ? '#111' : '#ddd'} `,
                                    padding: '0.6rem 1.4rem',
                                    borderRadius: '100px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: '#fff',
                            border: '1px solid #ddd',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '100px',
                            width: '200px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'width 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.width = '280px'}
                        onBlur={(e) => e.target.style.width = '200px'}
                    />
                </div>
            </div>

            {/* Grid */}
            <div ref={gridRef} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem',
                maxWidth: '1800px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                {filteredRackets.map((racket) => (
                    <div
                        key={racket._id}
                        className="racket-card"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => navigate(`/rackets/${racket._id}`)}
                        style={{
                            background: 'transparent',
                            borderRadius: '0',
                            overflow: 'visible', // Allow content to flow
                            position: 'relative',
                            cursor: 'pointer',
                            flexDirection: 'column',
                            transformStyle: 'preserve-3d',
                            opacity: 0 // Start hidden for GSAP to reveal
                        }}
                    >
                        {/* Image Area - The Colored Box */}
                        <div style={{
                            width: '100%',
                            aspectRatio: '0.85', // Tall portrait rectangle
                            background: '#F4F4F4', // The Wilson Light Grey/Beige
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            overflow: 'hidden'
                        }}>
                            {/* Badge - Top Left, Small & Clean */}
                            <div className="card-badge" style={{
                                position: 'absolute',
                                top: '1rem',
                                left: '1rem',
                                background: '#FFF',
                                color: '#111',
                                padding: '0.2rem 0.6rem',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                zIndex: 10,
                                letterSpacing: '0.05em'
                            }}>
                                New
                            </div>

                            {racket.imageUrl ? (
                                <img
                                    src={racket.imageUrl}
                                    alt={racket.name}
                                    className="card-image"
                                    style={{
                                        maxWidth: '85%',
                                        maxHeight: '85%',
                                        objectFit: 'contain',
                                        transform: 'rotate(0deg)', // Upright
                                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.08))', // Subtle shadow
                                        willChange: 'transform'
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: '4rem' }}>🏸</span>
                            )}

                            {/* Quick Add Overlay Button - Hidden by default */}
                            <button
                                className="buy-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCheckout(racket);
                                }}
                                style={{
                                    position: 'absolute',
                                    bottom: '1.5rem',
                                    left: '50%',
                                    transform: 'translateX(-50%) translateY(20px)',
                                    background: '#111',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '100px',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    opacity: 0,
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
                                }}
                            >
                                Quick Add
                            </button>
                        </div>

                        {/* Content Area - Below Image, Clean */}
                        <div style={{
                            padding: '0',
                            textAlign: 'left' // Explicit left align
                        }}>
                            <h3 style={{
                                fontFamily: 'var(--font-sans)', // Wilson uses clean sans for list items often
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#111',
                                margin: '0 0 0.5rem 0',
                                lineHeight: 1.4,
                                height: 'auto'
                            }}>{racket.name}</h3>

                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: '#111'
                            }}>
                                {region.currencySymbol}{Math.round(racket.price * region.multiplier).toLocaleString()}.00
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredRackets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '6rem', color: '#999', fontSize: '1.2rem', fontWeight: 300 }}>
                    No weapons match your criteria.
                </div>
            )}
        </section>
    );
};

export default RacketCatalog;
