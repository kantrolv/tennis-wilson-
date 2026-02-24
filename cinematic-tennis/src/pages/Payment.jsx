import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import Layout from '../components/layout/Layout';
import {
    getPaymentMethods,
    calculateTax,
    calculateShipping,
    generateOrderId,
    getDeliveryEstimate
} from '../constants/paymentConfig';
import axios from 'axios';
import '../styles/Payment.css';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, cartTotal, clearCart } = useCart();
    const { region } = useRegion();

    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [cardDetails, setCardDetails] = useState({
        number: '', name: '', expiry: '', cvv: ''
    });
    const [upiId, setUpiId] = useState('');
    const [sepaIban, setSepaIban] = useState('');

    // Shipping address from checkout page
    const shippingAddress = location.state?.shippingAddress;

    useEffect(() => {
        if ((cart.length === 0 || !shippingAddress) && !paymentDone && !isProcessing) {
            navigate('/checkout');
        }
    }, [cart, shippingAddress, navigate, paymentDone, isProcessing]);

    const regionCode = region.countryCode;
    const paymentMethods = getPaymentMethods(regionCode);

    // Calculate order totals
    const subtotalLocal = Math.round(cartTotal * region.multiplier);
    const tax = calculateTax(subtotalLocal, regionCode);
    const shipping = calculateShipping(cartTotal, regionCode, region.multiplier);
    const total = subtotalLocal + tax.amount + shipping.amount;

    // Delivery estimate
    const deliveryEst = getDeliveryEstimate(regionCode);
    const formatDeliveryDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatCurrency = (amount) => {
        return `${region.currencySymbol}${amount.toLocaleString()}`;
    };

    // Processing step animation
    useEffect(() => {
        if (isProcessing) {
            const steps = [0, 1, 2, 3];
            const timers = steps.map((step, idx) =>
                setTimeout(() => setProcessingStep(idx), idx * 700)
            );
            return () => timers.forEach(clearTimeout);
        }
    }, [isProcessing]);

    const handlePayNow = async () => {
        if (!selectedMethod) return;

        const selectedPaymentObj = paymentMethods.find(m => m.id === selectedMethod);
        if (selectedPaymentObj?.type === 'card') {
            if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
                alert("Please fill in all card details to proceed.");
                return;
            }
            if (cardDetails.number.replace(/\s/g, '').length < 15) {
                alert("Please enter a valid card number.");
                return;
            }
            if (cardDetails.expiry.length < 5) {
                alert("Please enter a valid expiry date (MM/YY).");
                return;
            }
            if (cardDetails.cvv.length < 3) {
                alert("Please enter a valid CVV.");
                return;
            }
        } else if (selectedPaymentObj?.type === 'upi') {
            if (!upiId) {
                alert("Please enter your UPI ID.");
                return;
            }
        } else if (selectedPaymentObj?.type === 'bank') {
            if (!sepaIban) {
                alert("Please enter your IBAN.");
                return;
            }
        }

        setIsProcessing(true);
        setProcessingStep(0);

        try {
            // Simulate processing steps in UI
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Get user token
            let token = localStorage.getItem('token');
            if (!token) {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    try {
                        const parsed = JSON.parse(userInfo);
                        token = parsed.token;
                    } catch (e) {
                        console.error('Failed to parse userInfo for token');
                    }
                }
            }

            if (!token) {
                throw new Error("You must be logged in to place an order.");
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const backendUrl = 'http://localhost:5001';

            // Submit order to backend
            const orderPayload = {
                orderItems: cart.map(item => ({
                    product: item.product || item._id, // exact string 
                    name: item.name,
                    qty: item.quantity || item.qty || 1,
                    gripSize: item.gripSize || item.selectedGrip || 'N/A',
                    price: Math.round((item.price) * region.multiplier),
                    imageUrl: item.imageUrl || item.image || ''
                })),
                totalPrice: total,
                shippingAddress: {
                    fullName: shippingAddress.fullName,
                    phoneNumber: shippingAddress.phoneNumber,
                    addressLine1: shippingAddress.addressLine1,
                    addressLine2: shippingAddress.addressLine2 || '',
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country,
                    label: shippingAddress.label || 'Home'
                }
            };

            const { data } = await axios.post(`${backendUrl}/api/orders`, orderPayload, config);

            setIsProcessing(false);
            setPaymentDone(true);

            // After showing "Payment Done" for 2 seconds, navigate
            setTimeout(() => {
                const orderId = data._id || generateOrderId();
                const delivery = getDeliveryEstimate(regionCode);
                const selectedPaymentObj = paymentMethods.find(m => m.id === selectedMethod);

                navigate('/order-success', {
                    state: {
                        orderId,
                        paymentMethod: selectedPaymentObj?.name || 'Unknown',
                        shippingAddress,
                        regionName: region.countryName,
                        currency: region.currency,
                        currencySymbol: region.currencySymbol,
                        deliveryEstimate: delivery,
                        orderSummary: {
                            items: cart.map(item => ({
                                name: item.name,
                                qty: item.quantity,
                                price: Math.round(item.price * region.multiplier)
                            })),
                            subtotal: subtotalLocal,
                            tax,
                            shipping,
                            total
                        }
                    }
                });
            }, 2000);
        } catch (error) {
            console.error('Failed to place order', error);
            alert(error.response?.data?.message || error.message || "Payment failed. Please try again.");
            setIsProcessing(false);
            setProcessingStep(0);
        }
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 16);
        return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const formatExpiry = (value) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        return cleaned;
    };

    // Payment method icon renderer
    const renderMethodIcon = (method) => {
        const iconMap = {
            paypal: (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <path d="M19.5 6.5c.6 2.2-.4 4.8-2.5 6-1 .6-2.3.8-3.5.8h-.7c-.3 0-.6.2-.7.5l-.8 4.5c0 .2-.2.3-.4.3h-2.4c-.2 0-.3-.2-.3-.4l.1-.5 1.8-10.3c.1-.4.4-.6.8-.6h4.3c1.6 0 3 .5 3.3 2.2z" fill="#003087" />
                    <path d="M7.7 3.5c.1-.4.4-.6.8-.6h4.3c1.6 0 3.3.5 3.7 2.2.1.5.1 1 0 1.5-.6-2.7-3-3.2-5.2-3.2H8.2c-.3 0-.6.2-.7.5L5.2 15.3c0 .2.1.4.3.4h2.6l.7-3.7.9-5z" fill="#002F86" opacity=".7" />
                </svg>
            ),
            apple: (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.02 9.03 8.73c1.27.07 2.16.72 2.91.76.84-.18 1.65-.82 2.97-.74 1.72.11 3.01.92 3.63 2.31-3.27 1.96-2.49 6.29.71 7.5-.57 1.49-1.3 2.95-2.2 3.72zM12.03 8.65c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.52-3.74 4.25z" />
                </svg>
            ),
            google: (
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
            ),
            upi: (
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <rect width="24" height="24" rx="4" fill="#5F259F" />
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">UPI</text>
                </svg>
            ),
            phonepe: (
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <rect width="24" height="24" rx="4" fill="#5F259F" />
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">PhonePe</text>
                </svg>
            ),
            paytm: (
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <rect width="24" height="24" rx="4" fill="#00B9F1" />
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">Paytm</text>
                </svg>
            ),
            paypay: (
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <rect width="24" height="24" rx="4" fill="#FF0033" />
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">PayPay</text>
                </svg>
            ),
            sepa: (
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <rect width="24" height="24" rx="4" fill="#004494" />
                    <text x="12" y="16" textAnchor="middle" fill="#FFC72C" fontSize="6" fontWeight="bold">SEPA</text>
                </svg>
            ),
            cb: (
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <rect width="24" height="24" rx="4" fill="#1A1F71" />
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">CB</text>
                </svg>
            ),
            afterpay: (
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <rect width="24" height="24" rx="4" fill="#B2FCE4" />
                    <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="5" fontWeight="bold">Afterpay</text>
                </svg>
            ),
            cod: (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.91-1.51 2.99-3.12 3.19z" />
                </svg>
            ),
        };
        if (method.icon === '💳') {
            return (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
            );
        }
        return iconMap[method.icon] || <span className="pay-icon-fallback">{method.icon}</span>;
    };

    // Render expanded payment form for selected method
    const renderPaymentForm = (method) => {
        if (selectedMethod !== method.id) return null;

        switch (method.type) {
            case 'card':
                return (
                    <div className="pay-form-fields" onClick={e => e.stopPropagation()}>
                        <div className="pay-form-group full-w">
                            <label>Card Number</label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={cardDetails.number}
                                onChange={e => setCardDetails(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                                maxLength={19}
                            />
                        </div>
                        <div className="pay-form-group full-w">
                            <label>Cardholder Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={cardDetails.name}
                                onChange={e => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="pay-form-row-2">
                            <div className="pay-form-group">
                                <label>Expiry</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardDetails.expiry}
                                    onChange={e => setCardDetails(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                                    maxLength={5}
                                />
                            </div>
                            <div className="pay-form-group">
                                <label>CVV</label>
                                <input
                                    type="text"
                                    placeholder="•••"
                                    value={cardDetails.cvv}
                                    onChange={e => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                    maxLength={4}
                                />
                            </div>
                        </div>
                        {method.brands && (
                            <div className="pay-brands">
                                {method.brands.map(b => (
                                    <span key={b} className="pay-brand-badge">{b}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'upi':
                return (
                    <div className="pay-form-fields" onClick={e => e.stopPropagation()}>
                        <div className="pay-form-group full-w">
                            <label>UPI ID</label>
                            <input
                                type="text"
                                placeholder="yourname@upi"
                                value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 'bank':
                return (
                    <div className="pay-form-fields" onClick={e => e.stopPropagation()}>
                        <div className="pay-form-group full-w">
                            <label>IBAN</label>
                            <input
                                type="text"
                                placeholder="DE89 3704 0044 0532 0130 00"
                                value={sepaIban}
                                onChange={e => setSepaIban(e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 'wallet':
                return (
                    <div className="pay-form-fields" onClick={e => e.stopPropagation()}>
                        <p className="pay-wallet-info">
                            You will be redirected to {method.name} to complete your payment securely.
                        </p>
                    </div>
                );
            case 'bnpl':
                return (
                    <div className="pay-form-fields" onClick={e => e.stopPropagation()}>
                        <p className="pay-wallet-info">
                            Pay in 4 interest-free installments of {formatCurrency(Math.round(total / 4))} with {method.name}.
                        </p>
                    </div>
                );
            case 'cod':
                return (
                    <div className="pay-form-fields" onClick={e => e.stopPropagation()}>
                        <p className="pay-wallet-info">
                            Pay with cash when your order is delivered. Please keep exact change ready.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    if ((!shippingAddress || cart.length === 0) && !paymentDone && !isProcessing) return null;

    const processingSteps = [
        'Verifying payment details...',
        'Encrypting transaction...',
        'Processing payment...',
        'Confirming order...'
    ];

    return (
        <Layout>
            <div className="payment-container">
                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="payment-overlay">
                        <div className="payment-overlay-content">
                            <div className="payment-spinner">
                                <div className="spinner-ring"></div>
                                <div className="spinner-ring-2"></div>
                                <svg className="spinner-lock" viewBox="0 0 24 24" width="28" height="28" fill="var(--c-tennis-green)">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                                </svg>
                            </div>
                            <h3>Processing Payment</h3>
                            <div className="processing-steps">
                                {processingSteps.map((step, idx) => (
                                    <div
                                        key={idx}
                                        className={`processing-step ${processingStep === idx ? 'active' : ''} ${processingStep > idx ? 'done' : ''}`}
                                    >
                                        {processingStep > idx ? (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                        ) : processingStep === idx ? (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ animation: 'spinRing 1s linear infinite' }}>
                                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="processing-bar">
                                <div className="processing-bar-fill"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Done Overlay */}
                {paymentDone && (
                    <div className="payment-overlay">
                        <div className="payment-done-content">
                            <div className="done-checkmark-wrapper">
                                <svg className="done-checkmark" viewBox="0 0 52 52">
                                    <circle className="done-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                    <path className="done-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                            </div>
                            <h3 className="done-title">Payment Successful!</h3>
                            <p className="done-amount">{formatCurrency(total)}</p>
                            <p className="done-subtitle">Redirecting to your order confirmation...</p>
                            <div className="done-dots">
                                <span className="done-dot"></span>
                                <span className="done-dot"></span>
                                <span className="done-dot"></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step Indicator */}
                <div className="payment-steps">
                    <div className="payment-step completed">
                        <span className="payment-step-number">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        </span>
                        <span>Address</span>
                    </div>
                    <div className="payment-step-connector completed" />
                    <div className="payment-step active">
                        <span className="payment-step-number">2</span>
                        <span>Payment</span>
                    </div>
                    <div className="payment-step-connector" />
                    <div className="payment-step">
                        <span className="payment-step-number">3</span>
                        <span>Confirmation</span>
                    </div>
                </div>

                <div className="payment-header">
                    <h1 className="payment-title">Secure Payment</h1>
                    <p className="payment-subtitle">Choose your preferred payment method</p>

                    <div className="payment-security-badges">
                        <div className="security-badge">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                            </svg>
                            <span>SSL Secured</span>
                        </div>
                        <div className="security-badge">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                            </svg>
                            <span>256-bit Encryption</span>
                        </div>
                        <div className="security-badge">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span>Demo Mode</span>
                        </div>
                    </div>
                </div>

                <div className="payment-layout">
                    {/* Left: Payment Methods */}
                    <div className="payment-methods-section">
                        <div className="pay-section-label">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                            </svg>
                            Payment Methods for {region.countryName}
                        </div>

                        <div className="payment-methods-list">
                            {paymentMethods.map(method => (
                                <div
                                    key={method.id}
                                    className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedMethod(method.id)}
                                >
                                    <div className="method-card-header">
                                        <div className="method-radio">
                                            <div className={`radio-circle ${selectedMethod === method.id ? 'active' : ''}`}>
                                                {selectedMethod === method.id && <div className="radio-dot" />}
                                            </div>
                                        </div>
                                        <div className="method-icon">
                                            {renderMethodIcon(method)}
                                        </div>
                                        <div className="method-info">
                                            <span className="method-name">{method.name}</span>
                                            {method.brands && (
                                                <span className="method-brands-hint">{method.brands.join(', ')}</span>
                                            )}
                                        </div>
                                    </div>
                                    {renderPaymentForm(method)}
                                </div>
                            ))}
                        </div>

                        {/* Shipping to */}
                        <div className="pay-shipping-summary">
                            <div className="pay-section-label">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                </svg>
                                Shipping To
                            </div>
                            <div className="pay-address-card">
                                <p className="pay-addr-name">{shippingAddress.fullName}</p>
                                <p>{shippingAddress.addressLine1}</p>
                                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                                <p>{shippingAddress.country}</p>
                                <button
                                    className="pay-change-btn"
                                    onClick={() => navigate('/checkout')}
                                >
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                    </svg>
                                    Change Address
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="payment-summary-section">
                        <div className="payment-summary-card">
                            <div className="pay-section-label">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                                Order Summary
                            </div>

                            <div className="pay-items-list">
                                {cart.map((item, i) => (
                                    <div key={i} className="pay-item">
                                        <div className="pay-item-info">
                                            <span className="pay-item-name">{item.name}</span>
                                            <span className="pay-item-qty">× {item.quantity}</span>
                                        </div>
                                        <span className="pay-item-price">
                                            {formatCurrency(Math.round(item.price * item.quantity * region.multiplier))}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pay-divider" />

                            <div className="pay-totals">
                                <div className="pay-total-row">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotalLocal)}</span>
                                </div>
                                <div className="pay-total-row">
                                    <span>{tax.label}</span>
                                    <span>{formatCurrency(tax.amount)}</span>
                                </div>
                                <div className="pay-total-row">
                                    <span>{shipping.label}</span>
                                    <span className={shipping.isFree ? 'pay-free' : ''}>
                                        {shipping.isFree ? 'FREE' : formatCurrency(shipping.amount)}
                                    </span>
                                </div>
                                <div className="pay-divider" />
                                <div className="pay-total-row pay-grand-total">
                                    <span>Total ({region.currency})</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>

                            {/* Delivery Estimate */}
                            <div className="pay-delivery-row">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                                <span>
                                    Delivery: <strong>{formatDeliveryDate(deliveryEst.from)} – {formatDeliveryDate(deliveryEst.to)}</strong>
                                </span>
                            </div>

                            <button
                                className="pay-now-btn"
                                disabled={!selectedMethod || isProcessing}
                                onClick={handlePayNow}
                            >
                                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                            </button>

                            <div className="pay-secure-footer">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="#999">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                                </svg>
                                <span>Your payment information is encrypted and secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Payment;
