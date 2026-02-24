import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Layout from '../components/layout/Layout';
import '../styles/OrderSuccess.css';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const [showContent, setShowContent] = useState(false);
    const hasClearedRef = useRef(false);

    const orderData = location.state;

    useEffect(() => {
        if (!orderData) {
            navigate('/');
            return;
        }

        // Clear cart securely once user lands on success page
        if (!hasClearedRef.current) {
            clearCart();
            hasClearedRef.current = true;
        }

        // Trigger entrance animation
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, [orderData, navigate, clearCart]);

    if (!orderData) return null;

    const {
        orderId,
        paymentMethod,
        shippingAddress,
        regionName,
        currency,
        currencySymbol,
        deliveryEstimate,
        orderSummary
    } = orderData;

    const formatCurrency = (amount) => `${currencySymbol}${amount.toLocaleString()}`;

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Layout>
            <div className={`success-container ${showContent ? 'visible' : ''}`}>
                {/* Animated Success Checkmark */}
                <div className="success-hero">
                    <div className="success-checkmark-wrapper">
                        <svg className="success-checkmark" viewBox="0 0 52 52">
                            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <h1 className="success-title">Order Confirmed!</h1>
                    <p className="success-subtitle">
                        Thank you for your purchase. Your order has been placed successfully.
                    </p>
                    <div className="success-order-id">
                        <span className="order-id-label">Order ID</span>
                        <span className="order-id-value">{orderId}</span>
                    </div>
                </div>

                <div className="success-grid">
                    {/* Order Details Card */}
                    <div className="success-card">
                        <h3 className="card-title">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z" />
                            </svg>
                            Order Details
                        </h3>

                        <div className="detail-rows">
                            <div className="detail-row">
                                <span className="detail-label">Payment Method</span>
                                <span className="detail-value">{paymentMethod}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Region</span>
                                <span className="detail-value">{regionName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Currency</span>
                                <span className="detail-value">{currency} ({currencySymbol})</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Estimated Delivery</span>
                                <span className="detail-value highlight">
                                    {formatDate(deliveryEstimate.from)} — {formatDate(deliveryEstimate.to)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address Card */}
                    <div className="success-card">
                        <h3 className="card-title">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            Shipping Address
                        </h3>

                        <div className="address-block">
                            <p className="addr-name">{shippingAddress.fullName}</p>
                            <p>{shippingAddress.addressLine1}</p>
                            {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                            <p>{shippingAddress.country}</p>
                            {shippingAddress.phoneNumber && <p className="addr-phone">{shippingAddress.phoneNumber}</p>}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="success-card summary-card">
                    <h3 className="card-title">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                        Order Summary
                    </h3>

                    <div className="summary-items">
                        {orderSummary.items.map((item, i) => (
                            <div key={i} className="summary-item-row">
                                <div className="item-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-qty">× {item.qty}</span>
                                </div>
                                <span className="item-price">{formatCurrency(item.price * item.qty)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="summary-divider" />

                    <div className="summary-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(orderSummary.subtotal)}</span>
                        </div>
                        <div className="total-row">
                            <span>{orderSummary.tax.label}</span>
                            <span>{formatCurrency(orderSummary.tax.amount)}</span>
                        </div>
                        <div className="total-row">
                            <span>{orderSummary.shipping.label}</span>
                            <span className={orderSummary.shipping.isFree ? 'free-badge' : ''}>
                                {orderSummary.shipping.isFree ? 'FREE' : formatCurrency(orderSummary.shipping.amount)}
                            </span>
                        </div>
                        <div className="summary-divider" />
                        <div className="total-row grand-total">
                            <span>Total Paid ({currency})</span>
                            <span>{formatCurrency(orderSummary.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="success-actions">
                    <button className="action-btn-primary" onClick={() => navigate('/rackets')}>
                        Continue Shopping
                    </button>
                    <button className="action-btn-secondary" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>

                {/* Footer note */}
                <p className="success-note">
                    A confirmation email will be sent to your registered email address.
                    <br />
                    <em>This is a demo transaction — no real payment was processed.</em>
                </p>
            </div>
        </Layout>
    );
};

export default OrderSuccess;
