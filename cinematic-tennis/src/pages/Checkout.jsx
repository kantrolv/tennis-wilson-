import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import Layout from '../components/layout/Layout';
import LOCATION_DATA from '../constants/locations';
import { getDeliveryEstimate } from '../constants/paymentConfig';
import '../styles/Checkout.css';

const Checkout = () => {
    const { user, addAddress, deleteAddress, updateAddress } = useAuth();
    const { cart, cartTotal } = useCart();
    const { region } = useRegion();
    const navigate = useNavigate();

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const [formData, setFormData] = useState({
        label: 'Home',
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
    });
    const [customLabel, setCustomLabel] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const selectedCountryData = LOCATION_DATA.find(c => c.name === formData.country);
    const availableStates = selectedCountryData?.states || [];

    // Delivery estimate
    const deliveryEst = getDeliveryEstimate(region.countryCode);
    const formatDeliveryDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/rackets');
        }
    }, [cart, navigate]);

    // Set default selected address
    useEffect(() => {
        if (user?.addresses?.length > 0 && !selectedAddressId) {
            const defaultAddr = user.addresses.find(a => a.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id);
            } else {
                setSelectedAddressId(user.addresses[0]._id);
            }
        }
    }, [user, selectedAddressId]);

    const handleAddressSelect = (id) => {
        setSelectedAddressId(id);
    };

    const getUserCountryName = () => {
        const regionData = LOCATION_DATA.find(c => c.countryCode === region?.countryCode);
        return regionData ? regionData.name : 'United States';
    };

    const handleAddNewClick = () => {
        setEditingAddressId(null);
        const defaultCountry = getUserCountryName();
        const countryData = LOCATION_DATA.find(c => c.name === defaultCountry);

        setFormData({
            label: 'Home',
            fullName: user?.name || '',
            phoneNumber: countryData?.phoneCode ? `${countryData.phoneCode} ` : '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: defaultCountry,
            isDefault: user?.addresses?.length === 0
        });
        setCustomLabel('');
        setShowAddressForm(true);
    };

    const handleEditClick = (e, address) => {
        e.stopPropagation();
        setEditingAddressId(address._id);
        const isCustomLabel = !['Home', 'Office'].includes(address.label);
        setFormData({
            label: isCustomLabel ? 'Other' : address.label,
            fullName: address.fullName,
            phoneNumber: address.phoneNumber,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault
        });
        if (isCustomLabel) setCustomLabel(address.label);
        setShowAddressForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'country') {
            const newCountryData = LOCATION_DATA.find(c => c.name === value);
            setFormData(prev => ({
                ...prev,
                country: value,
                state: '',
                phoneNumber: newCountryData?.phoneCode ? `${newCountryData.phoneCode} ` : ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        const countryConfig = LOCATION_DATA.find(c => c.name === formData.country);

        if (countryConfig) {
            let phoneInput = formData.phoneNumber;
            if (countryConfig.phoneCode && phoneInput.startsWith(countryConfig.phoneCode)) {
                phoneInput = phoneInput.replace(countryConfig.phoneCode, '');
            }
            const cleanPhone = phoneInput.replace(/\D/g, '');

            if (countryConfig.phoneLength && cleanPhone.length !== countryConfig.phoneLength) {
                alert(`Invalid Phone Number. For ${formData.country}, please enter exactly ${countryConfig.phoneLength} digits.`);
                setFormLoading(false);
                return;
            }

            if (countryConfig.postalCodeRegex) {
                const cleanPostalCode = formData.postalCode.replace(/\s+/g, '');
                if (!countryConfig.postalCodeRegex.test(cleanPostalCode)) {
                    alert(`Invalid Postal/Zip Code format for ${formData.country}.`);
                    setFormLoading(false);
                    return;
                }
            }

            if (countryConfig.states && countryConfig.states.length > 0) {
                if (!countryConfig.states.includes(formData.state)) {
                    alert(`Please select a valid state for ${formData.country}.`);
                    setFormLoading(false);
                    return;
                }
            }
        }

        try {
            const addressToSave = {
                ...formData,
                label: formData.label === 'Other' ? customLabel : formData.label,
            };

            if (editingAddressId) {
                await updateAddress(editingAddressId, addressToSave);
            } else {
                await addAddress(addressToSave);
            }

            setShowAddressForm(false);
            setEditingAddressId(null);
        } catch (error) {
            console.error("Failed to save address", error);
            alert(error.response?.data?.message || "Failed to save address");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteAddress = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteAddress(id);
                if (selectedAddressId === id) setSelectedAddressId(null);
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleProceedToPayment = () => {
        if (!selectedAddressId) return;
        const shippingAddress = user.addresses.find(a => a._id === selectedAddressId);
        navigate('/payment', { state: { shippingAddress } });
    };

    // Icon for address label
    const getLabelIcon = (label) => {
        switch (label?.toLowerCase()) {
            case 'home':
                return (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                );
            case 'office':
                return (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                    </svg>
                );
            default:
                return (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                );
        }
    };

    const formatCurrency = (amount) => {
        return `${region.currencySymbol}${amount.toLocaleString()}`;
    };

    return (
        <Layout>
            <div className="checkout-container">
                {/* Step Indicator */}
                <div className="checkout-steps">
                    <div className="checkout-step active">
                        <span className="step-number">1</span>
                        <span>Address</span>
                    </div>
                    <div className="step-connector" />
                    <div className="checkout-step">
                        <span className="step-number">2</span>
                        <span>Payment</span>
                    </div>
                    <div className="step-connector" />
                    <div className="checkout-step">
                        <span className="step-number">3</span>
                        <span>Confirmation</span>
                    </div>
                </div>

                <div className="checkout-header">
                    <h1 className="checkout-title">Shipping Address</h1>
                    <p>Choose where you'd like your order delivered</p>
                </div>

                <div className="checkout-layout">
                    {/* Left Column: Address Management */}
                    <div className="address-section">
                        <div className="section-title">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            {showAddressForm
                                ? (editingAddressId ? 'Edit Address' : 'Add New Address')
                                : 'Your Addresses'
                            }
                        </div>

                        {showAddressForm ? (
                            <div className="address-form-container">
                                <form onSubmit={handleSaveAddress}>
                                    {/* Full Name */}
                                    <div className="form-group full-width">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="fullName"
                                            placeholder="Enter your full name"
                                            value={formData.fullName}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                name="phoneNumber"
                                                placeholder="Enter phone number"
                                                value={formData.phoneNumber}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Address Label</label>
                                            <div className="radio-group" style={{ marginTop: '8px' }}>
                                                <label className="radio-label">
                                                    <input
                                                        type="radio"
                                                        name="label"
                                                        value="Home"
                                                        checked={formData.label === 'Home'}
                                                        onChange={handleFormChange}
                                                    /> Home
                                                </label>
                                                <label className="radio-label">
                                                    <input
                                                        type="radio"
                                                        name="label"
                                                        value="Office"
                                                        checked={formData.label === 'Office'}
                                                        onChange={handleFormChange}
                                                    /> Office
                                                </label>
                                                <label className="radio-label">
                                                    <input
                                                        type="radio"
                                                        name="label"
                                                        value="Other"
                                                        checked={formData.label === 'Other'}
                                                        onChange={handleFormChange}
                                                    /> Other
                                                </label>
                                            </div>
                                            {formData.label === 'Other' && (
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Custom Label (e.g. Vacation Home)"
                                                    value={customLabel}
                                                    onChange={(e) => setCustomLabel(e.target.value)}
                                                    style={{ marginTop: '10px' }}
                                                    required
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Address Line 1</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="addressLine1"
                                            placeholder="Street address, P.O. box, company name"
                                            value={formData.addressLine1}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Address Line 2 (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="addressLine2"
                                            placeholder="Apartment, suite, unit, building, floor, etc."
                                            value={formData.addressLine2}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Country</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                name="country"
                                                value={formData.country}
                                                readOnly
                                            />
                                            <span className="country-hint">
                                                <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                </svg>
                                                Based on your selected region
                                            </span>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">State / Province</label>
                                            {availableStates.length > 0 ? (
                                                <select
                                                    className="form-input form-select"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleFormChange}
                                                    required
                                                    disabled={!formData.country}
                                                >
                                                    <option value="" disabled>Select State</option>
                                                    {availableStates.map(state => (
                                                        <option key={state} value={state}>{state}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleFormChange}
                                                    required
                                                    disabled={!formData.country}
                                                    placeholder="Enter State/Province"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">City</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                name="city"
                                                placeholder="Enter city"
                                                value={formData.city}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Postal Code</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                name="postalCode"
                                                placeholder="Enter postal/zip code"
                                                value={formData.postalCode}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                checked={formData.isDefault}
                                                onChange={handleFormChange}
                                            /> Set as default shipping address
                                        </label>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => setShowAddressForm(false)}
                                            disabled={formLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={formLoading}
                                        >
                                            {formLoading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save Address')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="addresses-grid">
                                {user?.addresses?.map(address => (
                                    <div
                                        key={address._id}
                                        className={`address-card ${selectedAddressId === address._id ? 'selected' : ''}`}
                                        onClick={() => handleAddressSelect(address._id)}
                                    >
                                        <div className="address-card-header">
                                            <span className="address-label-badge">
                                                {getLabelIcon(address.label)}
                                                {address.label}
                                            </span>
                                            {address.isDefault && (
                                                <span className="default-badge">
                                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                    </svg>
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="address-details">
                                            <div className="name">{address.fullName}</div>
                                            <p>{address.addressLine1}</p>
                                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                                            <p>{address.city}, {address.state} {address.postalCode}</p>
                                            <p>{address.country}</p>
                                            <div className="address-phone">
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                                </svg>
                                                {address.phoneNumber}
                                            </div>
                                        </div>
                                        <div className="address-actions">
                                            <button
                                                className="address-action-btn"
                                                onClick={(e) => handleEditClick(e, address)}
                                            >
                                                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                className="address-action-btn delete-btn"
                                                onClick={(e) => handleDeleteAddress(e, address._id)}
                                            >
                                                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="add-new-address-card" onClick={handleAddNewClick}>
                                    <div className="add-icon-circle">+</div>
                                    <span>Add New Address</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="order-summary-section">
                        <div className="checkout-summary">
                            <div className="section-title">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                                Order Summary
                            </div>

                            {/* Items List */}
                            <div className="summary-items">
                                {cart.map((item, i) => (
                                    <div key={i} className="summary-item">
                                        <div className="summary-item-info">
                                            <span className="summary-item-name">{item.name}</span>
                                            <span className="summary-item-qty">× {item.quantity}</span>
                                        </div>
                                        <span className="summary-item-price">
                                            {formatCurrency(Math.round(item.price * item.quantity * region.multiplier))}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-row">
                                <span>Subtotal ({cart.reduce((a, c) => a + c.quantity, 0)} items)</span>
                                <span>{formatCurrency(Math.round(cartTotal * region.multiplier))}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="summary-free">Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total ({region.currency})</span>
                                <span>{formatCurrency(Math.round(cartTotal * region.multiplier))}</span>
                            </div>

                            {/* Delivery Estimate */}
                            <div className="delivery-estimate">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                </svg>
                                <span>
                                    Estimated delivery: <strong>{formatDeliveryDate(deliveryEst.from)} – {formatDeliveryDate(deliveryEst.to)}</strong>
                                </span>
                            </div>

                            <button
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '1.25rem' }}
                                disabled={!selectedAddressId || showAddressForm}
                                onClick={handleProceedToPayment}
                            >
                                Proceed to Payment →
                            </button>

                            <div className="security-note">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                                </svg>
                                Secure & Encrypted Checkout
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Checkout;
