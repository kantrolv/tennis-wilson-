import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useRegion } from '../../context/RegionContext';
import { getRegionalPrice, REGION_MAP } from '../../utils/regionPricing';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../styles/Shop.css';
import { useAuth } from '../../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const RacketCatalog = ({ onCheckout }) => {
    const { region } = useRegion();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [rackets, setRackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Initial Filter State from URL
    const initialFilters = useMemo(() => ({
        series: searchParams.get('series') ? searchParams.get('series').split(',') : [],
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        ageGroup: searchParams.get('ageGroup') || 'All'
    }), [searchParams]);

    const [filters, setFilters] = useState(initialFilters);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 500 }); // For slider visual calculation

    // Refs for animations
    const containerRef = useRef(null);
    const gridRef = useRef(null);

    // Fetch Rackets with Filters
    useEffect(() => {
        const fetchRackets = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.series.length > 0) params.append('series', filters.series.join(','));

                // Convert user-entered price (in local currency) to base USD for backend filtering
                const backendRegion = REGION_MAP[region.countryCode] || 'usa';
                // We'll filter client-side for now since backend filters on base price
                if (filters.minPrice) params.append('minPrice', Number(filters.minPrice) / region.multiplier);
                if (filters.maxPrice) params.append('maxPrice', Number(filters.maxPrice) / region.multiplier);

                if (filters.ageGroup && filters.ageGroup !== 'All') params.append('ageGroup', filters.ageGroup);

                params.append('region', backendRegion);

                const { data } = await axios.get(`http://localhost:5001/api/rackets?${params.toString()}`);
                setRackets(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load rackets. Please ensure the backend is running.');
                setLoading(false);
            }
        };

        // Debounce fetch for better UX
        const timeoutId = setTimeout(() => {
            fetchRackets();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters, region]);

    // Update URL when filters change
    useEffect(() => {
        const params = {};
        if (filters.series.length > 0) params.series = filters.series.join(',');
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.ageGroup && filters.ageGroup !== 'All') params.ageGroup = filters.ageGroup;
        setSearchParams(params);
    }, [filters, setSearchParams]);

    // Animation on Load
    useEffect(() => {
        if (!loading && rackets.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(".racket-card",
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.05,
                        ease: "power2.out",
                        clearProps: "all"
                    }
                );
            }, gridRef);
            return () => ctx.revert();
        }
    }, [loading, rackets]);

    // Handlers
    const toggleSeries = (seriesName) => {
        setFilters(prev => {
            const newSeries = prev.series.includes(seriesName)
                ? prev.series.filter(s => s !== seriesName)
                : [...prev.series, seriesName];
            return { ...prev, series: newSeries };
        });
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (cat) => {
        setFilters(prev => ({ ...prev, ageGroup: cat }));
    };

    const clearFilters = () => {
        setFilters({
            series: [],
            minPrice: '',
            maxPrice: '',
            ageGroup: 'All'
        });
    };

    // Series Options
    const seriesOptions = ["Blade", "Clash", "Pro Staff/RF", "Shift", "Ultra", "Other"];

    return (
        <section ref={containerRef} style={{
            backgroundColor: '#F7F7F5', // Light beige
            minHeight: '100vh',
            paddingTop: '6rem',
            paddingBottom: '6rem',
            fontFamily: 'var(--font-sans)',
            color: '#111'
        }}>
            <div className="section-header" style={{ padding: '0 2rem 4rem', textAlign: 'center' }}>
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                    color: '#051025',
                    marginBottom: '0.5rem'
                }}>Shop Rackets</h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Find your perfect weapon.</p>
            </div>

            <div className={`shop-container ${isMobileFilterOpen ? 'filters-open' : ''}`}>
                {/* Mobile Filter Toggle */}
                <button
                    className="mobile-filter-toggle"
                    onClick={() => setMobileFilterOpen(!isMobileFilterOpen)}
                >
                    {isMobileFilterOpen ? 'Close Filters' : 'Show Filters'}
                </button>

                {/* Sidebar */}
                <aside className={`shop-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: '#051025' }}>Filters</h3>
                        <button
                            onClick={clearFilters}
                            style={{
                                background: '#f3f4f6',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#4b5563',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e5e7eb';
                                e.currentTarget.style.color = '#051025';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f3f4f6';
                                e.currentTarget.style.color = '#4b5563';
                            }}
                        >
                            Reset
                        </button>
                    </div>

                    {/* Series Filter */}
                    <div className="filter-group">
                        <div className="filter-title">Racket Series</div>
                        {seriesOptions.map(series => (
                            <label key={series} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={filters.series.includes(series)}
                                    onChange={() => toggleSeries(series)}
                                />
                                <span className="checkbox-visual"></span>
                                {series}
                            </label>
                        ))}
                    </div>

                    {/* Player Category (Age Group) Filter */}
                    <div className="filter-group">
                        <div className="filter-title">Player Category</div>
                        <div className="pill-group">
                            <button
                                className={`filter-pill ${filters.ageGroup === 'All' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('All')}
                            >
                                All
                            </button>
                            <button
                                className={`filter-pill ${filters.ageGroup === 'Adult' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('Adult')}
                            >
                                Adult
                            </button>
                            <button
                                className={`filter-pill ${filters.ageGroup === 'Junior' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('Junior')}
                            >
                                Junior
                            </button>
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className="filter-group">
                        <div className="filter-title">Price Range</div>
                        <div className="price-inputs">
                            <div className="price-field-wrapper">
                                <span className="price-field-prefix">{region.symbol}</span>
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={handlePriceChange}
                                    className="price-field"
                                    min="0"
                                />
                            </div>
                            <span style={{ color: '#9ca3af', fontWeight: '500' }}>to</span>
                            <div className="price-field-wrapper">
                                <span className="price-field-prefix">{region.symbol}</span>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={handlePriceChange}
                                    className="price-field"
                                    min="0"
                                />
                            </div>
                        </div>
                        {/* Simple slider visual (non-functional/decorative for this iteration since standard <input range> logic is complex for dual handles without libs) */}
                        <div className="range-slider">
                            <div style={{
                                position: 'absolute',
                                left: `${Math.min(((filters.minPrice || 0) / 300) * 100, 100)}%`,
                                right: `${100 - Math.min(((filters.maxPrice || 300) / 300) * 100, 100)}%`,
                                height: '100%',
                                background: '#051025',
                                borderRadius: '4px'
                            }}></div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="shop-main">
                    {loading ? (
                        <div className="shop-loader">
                            Loading specialized equipment...
                        </div>
                    ) : error ? (
                        <div className="error-container">{error}</div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                Showing {rackets.length} results
                            </div>

                            {rackets.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                                    No rackets found matching your filters.
                                    <br />
                                    <button onClick={clearFilters} style={{ marginTop: '1rem', background: '#051025', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear Filters</button>
                                </div>
                            ) : (
                                <div ref={gridRef} className="shop-grid">
                                    {rackets.map((racket) => (
                                        <div
                                            key={racket._id}
                                            className="racket-card"
                                            onClick={() => navigate(`/rackets/${racket._id}`)}
                                            style={{
                                                background: '#fff',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-8px)';
                                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                                            }}
                                        >
                                            {/* Image Area */}
                                            <div style={{
                                                background: '#fcfcf7', // Slightly off-white
                                                padding: '2rem',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                position: 'relative'
                                            }}>
                                                {/* Badge */}
                                                {racket.name.includes('V9') || racket.name.includes('V14') ? (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        left: '12px',
                                                        background: '#051025',
                                                        color: '#fff',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        letterSpacing: '0.05em'
                                                    }}>NEW</span>
                                                ) : null}

                                                <img
                                                    src={racket.imageUrl}
                                                    alt={racket.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '250px',
                                                        objectFit: 'contain',
                                                        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))',
                                                        transition: 'transform 0.4s ease'
                                                    }}
                                                />
                                            </div>

                                            {/* Content Area */}
                                            <div style={{ padding: '1.5rem' }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: '#888',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    {racket.model} Series
                                                </div>
                                                <h3 style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    color: '#051025',
                                                    marginBottom: '0.5rem',
                                                    lineHeight: '1.4',
                                                    minHeight: '2.8em' // 2 lines
                                                }}>
                                                    {racket.name}
                                                </h3>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginTop: '1rem'
                                                }}>
                                                    <span style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: '700',
                                                        color: '#051025'
                                                    }}>
                                                        {(() => {
                                                            const rp = getRegionalPrice(racket, region);
                                                            return `${rp.symbol}${rp.price?.toLocaleString()}`;
                                                        })()}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!user) {
                                                                navigate('/login', { state: { from: location } });
                                                                return;
                                                            }
                                                            // Instead of immediate checkout, go to details page to select options
                                                            navigate(`/rackets/${racket._id}`);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid #111',
                                                            color: '#111',
                                                            padding: '0.4rem 1rem',
                                                            borderRadius: '100px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#111';
                                                            e.currentTarget.style.color = '#fff';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.color = '#111';
                                                        }}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RacketCatalog;
