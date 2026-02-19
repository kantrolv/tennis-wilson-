import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import LOCATION_DATA from '../constants/locations';
import '../styles/Checkout.css';

const Checkout = () => {
    const { user, addAddress, deleteAddress, updateAddress } = useAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const { region } = useRegion();
    const navigate = useNavigate();

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null); // Track editing ID

    // Initializing with global region default if valid, else US
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
    const [orderLoading, setOrderLoading] = useState(false);

    // Derived state for available states based on selected country
    const selectedCountryData = LOCATION_DATA.find(c => c.name === formData.country);
    const availableStates = selectedCountryData?.states || [];

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
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

    // Get country name from user's region — always locked to their region
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
                state: '', // Reset state on country change
                phoneNumber: newCountryData?.phoneCode ? `${newCountryData.phoneCode} ` : '' // Update phone prefix
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

        // Validation Logic using LOCATION_DATA
        const countryConfig = LOCATION_DATA.find(c => c.name === formData.country);

        if (countryConfig) {
            // Validate Phone Number
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

            // Validate Postal Code
            if (countryConfig.postalCodeRegex) {
                const cleanPostalCode = formData.postalCode.replace(/\s+/g, '');
                if (!countryConfig.postalCodeRegex.test(cleanPostalCode)) {
                    alert(`Invalid Postal/Zip Code format for ${formData.country}.`);
                    setFormLoading(false);
                    return;
                }
            }

            // Validate State
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
                // Note: We are keeping the countryCode implicitly via name mapping in backend or we could add it here
                // Based on User schema, it takes strings. We'll stick to full string names as per schema.
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

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return;
        setOrderLoading(true);

        const shippingAddress = user.addresses.find(a => a._id === selectedAddressId);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const orderItems = cart.map(item => ({
                product: item._id,
                name: item.name,
                qty: item.quantity,
                gripSize: item.selectedGrip || 'N/A',
                imageUrl: item.imageUrl,
                price: item.price
            }));


            await axios.post('http://localhost:5001/api/orders', {
                orderItems,
                shippingAddress,
                totalPrice: cartTotal
            }, config);

            clearCart();
            alert('Order Placed Successfully!');
            navigate('/');

        } catch (error) {
            console.error("Order failed", error);
            alert(error.response?.data?.message || "Order creation failed");
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <Layout>
            <div className="checkout-container">
                <div className="checkout-header">
                    <h1 className="checkout-title">Checkout</h1>
                    <p>Select your shipping address</p>
                </div>

                <div className="checkout-layout">
                    {/* Left Column: Address Management */}
                    <div className="address-section">
                        <div className="section-title">Shipping Address</div>

                        {showAddressForm ? (
                            <div className="address-form-container">
                                <form onSubmit={handleSaveAddress}>
                                    <div className="form-row">
                                        <div className="form-group full-width">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Address Label</label>
                                            <div className="radio-group" style={{ marginTop: '10px' }}>
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
                                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', opacity: 0.8 }}
                                            />
                                            <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>
                                                Country is set based on your region
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
                                                value={formData.postalCode}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="radio-label">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                checked={formData.isDefault}
                                                onChange={handleFormChange}
                                            /> Set as default address
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
                                            {formLoading ? 'Saving...' : 'Save Address'}
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
                                            <span className="address-label-badge">{address.label}</span>
                                            {address.isDefault && <span style={{ fontSize: '0.8rem', color: 'var(--c-tennis-green)' }}>Default</span>}
                                        </div>
                                        <div className="address-details">
                                            <div className="name">{address.fullName}</div>
                                            <p>{address.addressLine1}</p>
                                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                                            <p>{address.city}, {address.state} {address.postalCode}</p>
                                            <p>{address.country}</p>
                                            <p style={{ marginTop: '0.5rem' }}>{address.phoneNumber}</p>
                                        </div>
                                        <div className="address-actions" style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                                            <button
                                                className="address-action-btn"
                                                onClick={(e) => handleEditClick(e, address)}
                                                style={{ marginRight: '1rem' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="address-action-btn"
                                                onClick={(e) => handleDeleteAddress(e, address._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="add-new-address-card" onClick={handleAddNewClick}>
                                    <span className="add-icon">+</span>
                                    <span>Add New Address</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="order-summary-section">
                        <div className="checkout-summary">
                            <div className="section-title">Order Summary</div>

                            <div className="summary-row">
                                <span>Items ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
                                <span>{region.currencySymbol}{Math.round(cartTotal * region.multiplier).toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span style={{ color: 'var(--c-tennis-green)' }}>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{region.currencySymbol}{Math.round(cartTotal * region.multiplier).toLocaleString()}</span>
                            </div>

                            <button
                                className="btn-primary"
                                style={{ width: '100%' }}
                                disabled={!selectedAddressId || orderLoading}
                                onClick={handlePlaceOrder}
                            >
                                {orderLoading ? 'Processing...' : 'Place Order'}
                            </button>

                            <div className="security-note">
                                <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 0C8.3 0 10.3 1.2 11.2 3H11.5C11.8 3 12 3.2 12 3.5V14.5C12 14.8 11.8 15 11.5 15H0.5C0.2 15 0 14.8 0 14.5V3.5C0 3.2 0.2 3 0.5 3H0.8C1.7 1.2 3.7 0 6 0ZM6 2C4.3 2 2.8 3 2.2 4.5H9.8C9.2 3 7.7 2 6 2ZM3 10V11H9V10H3ZM3 8V9H9V8H3Z" fill="#999" />
                                </svg>
                                Secure Checkout
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Checkout;
