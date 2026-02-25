import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useRegion } from '../context/RegionContext';
import { getRegionalPrice, formatAddonPrice } from '../utils/regionPricing';
import { useCart } from '../context/CartContext'; // Import Cart Hook
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import gsap from 'gsap';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { region } = useRegion();
    const { addToCart } = useCart(); // Use Cart
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedString, setSelectedString] = useState(null);
    const [selectedCover, setSelectedCover] = useState(null);
    const [selectedGrip, setSelectedGrip] = useState(null); // Fix: Add selectedGrip state
    const [isStringDropdownOpen, setIsStringDropdownOpen] = useState(false);

    // Refs for animation
    const imageRef = useRef(null);
    const infoRef = useRef(null);

    // Mock Options Data (Ideally this would come from backend or a config file)
    const STRING_OPTIONS = [
        { id: 'unstrung', name: 'Unstrung', price: 0 },
        { id: 'syn_gut', name: 'Wilson Synthetic Gut Power', price: 20 },
        { id: 'nxt', name: 'Wilson NXT 16', price: 35 },
        { id: 'alu_power', name: 'Luxilon ALU Power 125', price: 30 },
        { id: 'rpm_blast', name: 'Babolat RPM Blast', price: 32 }, // Just for variety
    ];

    const COVER_OPTIONS = [
        { id: 'none', name: 'No Cover', price: 0 },
        { id: 'standard', name: 'Standard Wilson Cover', price: 15 },
        { id: 'premium', name: 'Premium Leather Cover', price: 50 },
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5001/api/rackets/${id}`);
                setProduct(data);
                // Set defaults once product is loaded
                if (data) {
                    setSelectedString(STRING_OPTIONS[0]); // Default to Unstrung
                    setSelectedCover(COVER_OPTIONS[0]); // Default to No Cover
                }
                setLoading(false);
            } catch (err) {
                setError('Product not found.');
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (!loading && product) {
            gsap.fromTo(imageRef.current,
                { opacity: 0, x: -50 },
                { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
            );
            gsap.fromTo(infoRef.current,
                { opacity: 0, x: 50 },
                { opacity: 1, x: 0, duration: 1, delay: 0.2, ease: "power3.out" }
            );
        }
    }, [loading, product]);

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }

        if (!selectedGrip) {
            alert("Please select a grip size.");
            return;
        }

        const cartItemOptions = {
            gripSize: selectedGrip.size,
            string: selectedString,
            cover: selectedCover,
        };

        addToCart(product, cartItemOptions, 1);
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F7F7F5' }}>
            Loading...
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F7F7F5' }}>
            {error}
        </div>
    );

    // Calculate dynamic price for display using regional pricing
    const rp = product ? getRegionalPrice(product, region) : { price: 0, symbol: '$', currency: 'USD' };
    const basePrice = rp.price;
    const stringAddon = selectedString ? formatAddonPrice(selectedString.price, product, region) : { amount: 0 };
    const coverAddon = selectedCover ? formatAddonPrice(selectedCover.price, product, region) : { amount: 0 };
    const totalPrice = basePrice + stringAddon.amount + coverAddon.amount;

    return (
        <Layout>
            <div style={{ backgroundColor: '#F7F7F5', minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
                {/* Breadcrumb */}
                <div style={{ padding: '1rem 4vw', fontSize: '0.8rem', color: '#000' }}>
                    <Link to="/rackets" style={{ textDecoration: 'none', color: '#000' }}>Rackets</Link> / {product.name}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', // Widened minmax slightly
                    gap: '6rem', // Increased gap for airy feel
                    maxWidth: '1600px',
                    margin: '0 auto',
                    padding: '2rem 4vw'
                }}>

                    {/* Left: Big Image */}
                    <div ref={imageRef} style={{
                        backgroundColor: '#F0F0F0', // Slightly darker grey for contrast
                        borderRadius: '0px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '75vh',
                        position: 'sticky',
                        top: '120px',
                        overflow: 'hidden'
                    }}>
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                    height: '85%',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.2))', // Dramatic shadow
                                    transform: 'scale(1.1)' // Removed rotation for straight look
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '5rem' }}>🏸</span>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div ref={infoRef} style={{ display: 'flex', flexDirection: 'column', padding: '1rem 0' }}>
                        <span style={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            fontSize: '0.75rem',
                            color: '#000',
                            marginBottom: '1rem',
                            fontWeight: 700
                        }}>
                            {product.brand} Tennis Rackets
                        </span>

                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '3.5rem',
                            margin: '0 0 1.5rem',
                            lineHeight: 1.05,
                            color: '#000',
                            letterSpacing: '-0.02em'
                        }}>
                            {product.name}
                        </h1>

                        <div style={{ fontSize: '1.75rem', fontWeight: 500, color: '#000', marginBottom: '3rem', fontFamily: 'var(--font-sans)' }}>
                            {rp.symbol}{totalPrice.toLocaleString()}.00
                        </div>

                        {/* --- Selections Container --- */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                            {/* 1. Grip Selection */}
                            <div>
                                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: '#000', fontWeight: 700 }}>1. Select Grip Size</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                    {product.gripStock && Object.entries(product.gripStock).map(([size, gripQty]) => {
                                        // Map user region to product stock key
                                        const regionMap = { 'US': 'usa', 'GB': 'uk', 'IN': 'india', 'AE': 'uae' };
                                        const regionKey = regionMap[region] || 'usa';
                                        const regionStock = product.stock ? product.stock[regionKey] : 0;

                                        const effectiveStock = Math.min(gripQty, regionStock);

                                        return (
                                            <button
                                                key={size}
                                                disabled={effectiveStock <= 0}
                                                onClick={() => setSelectedGrip({ size, stock: effectiveStock })}
                                                style={{
                                                    padding: '1rem 0',
                                                    width: '100px', // Fixed width for uniform look
                                                    border: selectedGrip?.size === size ? '2px solid #000' : '1px solid #000',
                                                    background: selectedGrip?.size === size ? '#000' : 'transparent',
                                                    color: selectedGrip?.size === size ? '#fff' : (effectiveStock <= 0 ? '#ccc' : '#000'),
                                                    borderRadius: '0px',
                                                    cursor: effectiveStock <= 0 ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    fontWeight: 500,
                                                    fontSize: '0.9rem',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedGrip && (
                                    <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: selectedGrip.stock < 3 ? '#e53e3e' : '#2f855a', fontWeight: 500 }}>
                                        {selectedGrip.stock > 0 ? `In Stock (${selectedGrip.stock} available in your region)` : 'Out of Stock'}
                                    </div>
                                )}
                            </div>

                            {/* 2. String Selection */}
                            <div style={{ position: 'relative' }}>
                                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: '#000', fontWeight: 700 }}>2. Choose Stringing</h3>

                                <div
                                    onClick={() => setIsStringDropdownOpen(!isStringDropdownOpen)}
                                    style={{
                                        border: '1px solid #000',
                                        padding: '1.2rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: '#fff',
                                        transition: 'all 0.2s',
                                        color: '#000'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#000'}
                                    onMouseLeave={(e) => !isStringDropdownOpen && (e.currentTarget.style.borderColor = '#000')}
                                >
                                    <span style={{ fontWeight: 500 }}>
                                        {selectedString ? selectedString.name : 'Select String...'}
                                    </span>
                                    <span style={{ color: '#000', fontWeight: 500 }}>
                                        {selectedString && selectedString.price > 0 ? `+ ${stringAddon.formatted}` : ''}
                                        <span style={{ marginLeft: '10px', fontSize: '0.8rem' }}>{isStringDropdownOpen ? '▲' : '▼'}</span>
                                    </span>
                                </div>

                                {isStringDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        zIndex: 10,
                                        background: '#fff',
                                        border: '1px solid #000',
                                        borderTop: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}>
                                        {STRING_OPTIONS.map(option => (
                                            <div
                                                key={option.id}
                                                onClick={() => {
                                                    setSelectedString(option);
                                                    setIsStringDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '1rem 1.2rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    borderBottom: '1px solid #f5f5f5',
                                                    background: selectedString?.id === option.id ? '#f9f9f9' : '#fff',
                                                    fontWeight: selectedString?.id === option.id ? 600 : 400,
                                                    color: '#000'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                                onMouseLeave={(e) => selectedString?.id !== option.id && (e.currentTarget.style.background = '#fff')}
                                            >
                                                <span>{option.name}</span>
                                                <span style={{ color: '#000' }}>{option.price > 0 ? `+ ${formatAddonPrice(option.price, product, region).formatted}` : 'Free'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 3. Cover Selection */}
                            <div>
                                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: '#000', fontWeight: 700 }}>3. Racket Cover</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {COVER_OPTIONS.map(option => (
                                        <div
                                            key={option.id}
                                            onClick={() => setSelectedCover(option)}
                                            style={{
                                                flex: 1,
                                                padding: '1rem',
                                                border: selectedCover?.id === option.id ? '2px solid #000' : '1px solid #000',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                background: selectedCover?.id === option.id ? '#fff' : 'transparent',
                                                transition: 'all 0.2s',
                                                opacity: selectedCover?.id === option.id ? 1 : 0.7,
                                                color: '#000'
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{option.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#000' }}>{option.price > 0 ? `+ ${formatAddonPrice(option.price, product, region).formatted}` : 'Included'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedGrip || selectedGrip.stock === 0}
                            style={{
                                backgroundColor: '#000',
                                color: '#fff',
                                border: 'none',
                                padding: '1.5rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                borderRadius: '0',
                                cursor: (!selectedGrip || selectedGrip.stock === 0) ? 'not-allowed' : 'pointer',
                                marginTop: '3rem',
                                opacity: (!selectedGrip || selectedGrip.stock === 0) ? 0.6 : 1,
                                transition: 'all 0.3s',
                                width: '100%',
                            }}
                        >
                            {selectedGrip ? `Add to Cart - ${rp.symbol}${totalPrice.toLocaleString()}` : 'Select a Grip Size'}
                        </button>

                        <div style={{ marginTop: '3rem', fontSize: '1rem', lineHeight: 1.7, color: '#000', maxWidth: '500px' }}>
                            <p>{product.description}</p>
                        </div>
                    </div>
                </div>

                {/* Overview / Specs Tabs Section (User requested "Overview which contain description") */}
                <div style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 4rem' }}>
                    <div style={{ borderBottom: '1px solid #000', marginBottom: '2rem' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '1rem 0',
                            borderBottom: '2px solid #000',
                            fontWeight: 600,
                            marginRight: '2rem',
                            color: '#000'
                        }}>
                            Overview
                        </span>
                        <span style={{ display: 'inline-block', padding: '1rem 0', color: '#000', opacity: 0.6 }}>
                            Features
                        </span>
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>Dominate with Precision.</h3>
                        <p style={{ lineHeight: 1.8, color: '#000' }}>
                            {product.description}
                            The {product.model} series combines classic design with modern performance technologies. Engineered for tournament-level play, it offers superior control and feel.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                            {/* Specs Table */}
                            <div>
                                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '1rem', letterSpacing: '0.1em', color: '#000' }}>Specs</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0', color: '#000' }}>
                                    <span>Head Size</span>
                                    <strong>{product.headSize || '98 sq in'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0', color: '#000' }}>
                                    <span>Length</span>
                                    <strong>27 in</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0', color: '#000' }}>
                                    <span>Strung Weight</span>
                                    <strong>{product.weight + 15}g</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0', color: '#000' }}>
                                    <span>Balance</span>
                                    <strong>{product.balance}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ProductDetails Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '100px', textAlign: 'center' }}>
                    <h2>Something went wrong.</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                    </details>
                    <a href="/rackets">Back to Rackets</a>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function WrappedProductDetails() {
    return (
        <ErrorBoundary>
            <ProductDetails />
        </ErrorBoundary>
    );
};
