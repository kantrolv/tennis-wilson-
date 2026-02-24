import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { useRegion } from '../context/RegionContext';
import '../styles/Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const { region } = useRegion();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Get token from either source (migration support)
                let token = localStorage.getItem('token');
                if (!token) {
                    const userInfo = localStorage.getItem('userInfo');
                    if (userInfo) {
                        try {
                            const parsed = JSON.parse(userInfo);
                            token = parsed.token;
                        } catch (e) {
                            console.error('Failed to parse userInfo');
                        }
                    }
                }

                if (!token) {
                    console.error('No authorization token found');
                    setLoading(false);
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Use absolute URL to avoid proxy issues, with fallback for local dev
                const backendUrl = 'http://localhost:5001';
                const { data } = await axios.get(`${backendUrl}/api/orders/myorders`, config);
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                // Optionally show error to user
            } finally {
                setLoading(false);
                // Technical delay for reveal animation
                setTimeout(() => setVisible(true), 100);
            }
        };

        fetchOrders();
    }, []);

    const formatCurrency = (amount) => {
        return `${region.currencySymbol}${amount.toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Layout>
            <div className={`orders-container ${visible ? 'visible' : ''}`}>
                <div className="orders-header">
                    <h1 className="orders-title">My Orders</h1>
                    <p className="orders-subtitle">View and track your editorial collection</p>
                </div>

                {loading ? (
                    <div className="orders-loading">
                        <div className="loader-spinner"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="orders-empty">
                        <div className="empty-icon">📦</div>
                        <p className="empty-text">You haven't placed any orders yet.</p>
                        <Link to="/rackets" className="shop-now-btn">Explore Collection</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Order Placed</span>
                                            <span className="meta-value">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Total</span>
                                            <span className="meta-value">{formatCurrency(order.totalPrice)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Ship To</span>
                                            <span className="meta-value">{order.shippingAddress.fullName}</span>
                                        </div>
                                    </div>
                                    <div className="order-status-badge">
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </div>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-items-list">
                                        {order.orderItems.map((item, idx) => (
                                            <div key={idx} className="order-item-row">
                                                <img
                                                    src={item.imageUrl || '/placeholder-racket.png'}
                                                    alt={item.name}
                                                    className="order-item-image"
                                                    onError={(e) => {
                                                        e.target.src = 'https://photos.tennis-warehouse.com/products/W1628-1.jpg';
                                                    }}
                                                />
                                                <div className="order-item-details">
                                                    <Link to={`/rackets/${item.product}`} className="item-name-link">
                                                        {item.name}
                                                    </Link>
                                                    <div className="item-meta-info">
                                                        Grip Size: {item.gripSize} | Quantity: {item.qty}
                                                    </div>
                                                </div>
                                                <div className="order-item-price">
                                                    {formatCurrency(item.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="order-card-footer">
                                    <Link to={`/order-success?id=${order._id}`} className="view-details-btn">
                                        View Order Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Orders;
