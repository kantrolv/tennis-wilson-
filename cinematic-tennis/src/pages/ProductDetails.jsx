import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useRegion } from '../context/RegionContext';
import Layout from '../components/layout/Layout';
import gsap from 'gsap';

const ProductDetails = () => {
    const { id } = useParams();
    const { region } = useRegion();
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
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '2rem 4vw'
                }}>

                    {/* Left: Big Image */}
                    <div ref={imageRef} style={{
                        backgroundColor: '#F4F4F4',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '600px', // Tall and imposing
                        position: 'relative'
                    }}>
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                    maxHeight: '85%',
                                    maxWidth: '85%',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))'
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '5rem' }}>🏸</span>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div ref={infoRef} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                            fontSize: '3rem',
                            margin: '0 0 1rem',
                            lineHeight: 1.1,
                            color: '#111'
                        }}>
                            {product.name}
                        </h1>

                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '2rem' }}>
                            {region.currencySymbol}{Math.round(product.price * region.multiplier).toLocaleString()}.00
                        </div>

                        {/* Inventory / Grip Selection */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#111' }}>Grip Size</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                {product.gripStock && Object.entries(product.gripStock).map(([size, stock]) => (
                                    <button
                                        key={size}
                                        disabled={stock === 0}
                                        onClick={() => setSelectedGrip({ size, stock })}
                                        style={{
                                            padding: '1rem 2rem',
                                            border: selectedGrip?.size === size ? '2px solid #111' : '1px solid #ddd',
                                            background: selectedGrip?.size === size ? '#fff' : 'transparent',
                                            color: stock === 0 ? '#ccc' : '#111',
                                            borderRadius: '4px',
                                            cursor: stock === 0 ? 'not-allowed' : 'pointer',
                                            minWidth: '80px',
                                            position: 'relative',
                                            transition: 'all 0.2s',
                                            fontWeight: 500
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {selectedGrip && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: selectedGrip.stock < 3 ? '#e53e3e' : '#2f855a' }}>
                                    {selectedGrip.stock > 0 ? `In Stock (${selectedGrip.stock})` : 'Out of Stock'}
                                </div>
                            )}
                        </div>

                        {/* Stringing Options - Placeholder for now as user requested */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#111' }}>Stringing</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button style={{ padding: '1rem 2rem', border: '1px solid #111', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                                    Unstrung
                                </button>
                                <button style={{ padding: '1rem 2rem', border: '1px solid #ddd', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                                    Strung (+ $20)
                                </button>
                            </div>
                        </div>

                        <button style={{
                            backgroundColor: '#111',
                            color: '#fff',
                            border: 'none',
                            padding: '1.2rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            opacity: selectedGrip ? 1 : 0.5,
                            pointerEvents: selectedGrip ? 'auto' : 'none',
                            transition: 'opacity 0.2s'
                        }}>
                            Add to Cart
                        </button>

                        <div style={{ marginTop: '2rem', fontSize: '0.9rem', lineHeight: 1.6, color: '#444' }}>
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
