import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useRegion } from '../context/RegionContext';
import { useCart } from '../context/CartContext'; // Import Cart Hook
import Layout from '../components/layout/Layout';
import gsap from 'gsap';

const ProductDetails = () => {
    const { id } = useParams();
    const { region } = useRegion();
    const { addToCart } = useCart(); // Use Cart
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGrip, setSelectedGrip] = useState(null);

    // Refs for animation
    const imageRef = useRef(null);
    const infoRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5001/api/rackets/${id}`);
                setProduct(data);
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
        if (!selectedGrip) {
            alert("Please select a grip size.");
            return;
        }
        addToCart(product, selectedGrip.size);
        // Optional: Custom toast here instead of auto-open logic in context
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

    return (
        <Layout>
            <div style={{ backgroundColor: '#F7F7F5', minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
                {/* Breadcrumb */}
                <div style={{ padding: '1rem 4vw', fontSize: '0.8rem', color: '#666' }}>
                    <Link to="/rackets" style={{ textDecoration: 'none', color: '#666' }}>Rackets</Link> / {product.name}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', // Responsive split
                    gap: '4rem',
                    maxWidth: '1600px', // Wider container for bigger impact
                    margin: '0 auto',
                    padding: '2rem 4vw'
                }}>

                    {/* Left: Big Image */}
                    <div ref={imageRef} style={{
                        backgroundColor: '#F4F4F4',
                        borderRadius: '0px', // Sharper, more premium
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '80vh', // HUGE image container
                        position: 'sticky',
                        top: '100px',
                        overflow: 'hidden'
                    }}>
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                    height: '90%', // Fill the container
                                    width: 'auto',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.15))', // Deeper shadow for depth
                                    transform: 'scale(1.1)' // Slight zoom for impact
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '5rem' }}>🏸</span>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div ref={infoRef} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 0' }}>
                        <span style={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontSize: '0.8rem',
                            color: '#666',
                            marginBottom: '0.5rem'
                        }}>
                            {product.brand} Tennis Rackets
                        </span>

                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '3.5rem', // Larger Details Title
                            margin: '0 0 1rem',
                            lineHeight: 1.1,
                            color: '#111'
                        }}>
                            {product.name}
                        </h1>

                        <div style={{ fontSize: '2rem', fontWeight: 600, color: '#111', marginBottom: '2.5rem' }}>
                            {region.currencySymbol}{Math.round(product.price * region.multiplier).toLocaleString()}.00
                        </div>

                        {/* Inventory / Grip Selection */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: '#111' }}>Select Grip Size</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                {product.gripStock && Object.entries(product.gripStock).map(([size, stock]) => (
                                    <button
                                        key={size}
                                        disabled={stock === 0}
                                        onClick={() => setSelectedGrip({ size, stock })}
                                        style={{
                                            padding: '1rem 2rem',
                                            border: selectedGrip?.size === size ? '2px solid #111' : '1px solid #e0e0e0',
                                            background: selectedGrip?.size === size ? '#111' : 'transparent', // Solid active state
                                            color: selectedGrip?.size === size ? '#fff' : (stock === 0 ? '#ccc' : '#111'),
                                            borderRadius: '0px', // Squared off for "technical" feel
                                            cursor: stock === 0 ? 'not-allowed' : 'pointer',
                                            minWidth: '80px',
                                            position: 'relative',
                                            transition: 'all 0.2s',
                                            fontWeight: 500,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {selectedGrip && (
                                <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: selectedGrip.stock < 3 ? '#e53e3e' : '#2f855a', fontWeight: 500 }}>
                                    {selectedGrip.stock > 0 ? `In Stock (${selectedGrip.stock} available)` : 'Out of Stock'}
                                </div>
                            )}
                        </div>

                        {/* Stringing - Still Placeholder */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: '#111' }}>Stringing</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button style={{ padding: '1rem 2rem', border: '1px solid #111', background: 'transparent', borderRadius: '0', cursor: 'pointer' }}>
                                    Unstrung
                                </button>
                                <button style={{ padding: '1rem 2rem', border: '1px solid #e0e0e0', background: 'transparent', borderRadius: '0', cursor: 'pointer', color: '#888' }}>
                                    Strung (+ $20)
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedGrip || selectedGrip.stock === 0}
                            style={{
                                backgroundColor: '#111',
                                color: '#fff',
                                border: 'none',
                                padding: '1.4rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                borderRadius: '0', // Square button
                                cursor: (!selectedGrip || selectedGrip.stock === 0) ? 'not-allowed' : 'pointer',
                                marginTop: '1rem',
                                opacity: (!selectedGrip || selectedGrip.stock === 0) ? 0.6 : 1,
                                transition: 'all 0.3s',
                                width: '100%', // Full width CTA
                                maxWidth: '400px'
                            }}
                        >
                            {selectedGrip ? 'Add to Cart' : 'Select a Grip Size'}
                        </button>

                        <div style={{ marginTop: '3rem', fontSize: '1rem', lineHeight: 1.7, color: '#444', maxWidth: '500px' }}>
                            <p>{product.description}</p>
                        </div>
                    </div>
                </div>

                {/* Overview / Specs Tabs Section (User requested "Overview which contain description") */}
                <div style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 4rem' }}>
                    <div style={{ borderBottom: '1px solid #ddd', marginBottom: '2rem' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '1rem 0',
                            borderBottom: '2px solid #111',
                            fontWeight: 600,
                            marginRight: '2rem'
                        }}>
                            Overview
                        </span>
                        <span style={{ display: 'inline-block', padding: '1rem 0', color: '#888' }}>
                            Features
                        </span>
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>Dominate with Precision.</h3>
                        <p style={{ lineHeight: 1.8, color: '#444' }}>
                            {product.description}
                            The {product.model} series combines classic design with modern performance technologies. Engineered for tournament-level play, it offers superior control and feel.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                            {/* Specs Table */}
                            <div>
                                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>Specs</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
                                    <span>Head Size</span>
                                    <strong>{product.headSize || '98 sq in'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
                                    <span>Length</span>
                                    <strong>27 in</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
                                    <span>Strung Weight</span>
                                    <strong>{product.weight + 15}g</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
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

export default ProductDetails;
