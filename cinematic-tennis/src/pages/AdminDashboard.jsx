import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', GBP: '£', AED: 'د.إ', EUR: '€', JPY: '¥', AUD: 'A$' };
const REGION_LABELS = {
    india: 'India', usa: 'United States', uk: 'United Kingdom', uae: 'United Arab Emirates',
    france: 'France', germany: 'Germany', japan: 'Japan', australia: 'Australia'
};

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [lowStock, setLowStock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // For Stock Update
    const [updatingStock, setUpdatingStock] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newStockValue, setNewStockValue] = useState('');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dashRes, lowStockRes, ordersRes, productsRes] = await Promise.all([
                axios.get('http://localhost:5001/api/admin/dashboard', authHeader),
                axios.get('http://localhost:5001/api/admin/low-stock', authHeader),
                axios.get('http://localhost:5001/api/admin/orders', authHeader),
                axios.get('http://localhost:5001/api/products'), // Get products to manage stock
            ]);
            setDashboard(dashRes.data);
            setLowStock(lowStockRes.data);
            setOrders(ordersRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setUpdatingStock(true);
        try {
            await axios.put(`http://localhost:5001/api/admin/update-stock/${selectedProduct}`, {
                stock: newStockValue
            }, authHeader);
            setStatusMsg({ type: 'success', text: 'Stock updated successfully!' });
            fetchData();
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
        } catch (err) {
            setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setUpdatingStock(false);
            setSelectedProduct(null);
            setNewStockValue('');
        }
    };

    if (loading) return <div style={styles.container}><div style={styles.loading}>Initializing Premium Admin Suite...</div></div>;
    if (error) return <div style={styles.container}><div style={styles.error}>❌ {error}</div></div>;

    const currSymbol = CURRENCY_SYMBOLS[dashboard?.currency] || '$';

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Regional Command</h1>
                    <p style={styles.subtitle}>
                        {REGION_LABELS[dashboard?.region] || dashboard?.region?.toUpperCase()} Operations
                        <span style={styles.dot}></span>
                        Logged in as <span style={{ fontWeight: '600', color: '#111' }}>{user?.name}</span>
                    </p>
                </div>
                <div style={styles.headerActions}>
                    <button style={styles.backBtn} onClick={() => navigate('/')}>View Store</button>
                    <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
                </div>
            </header>

            {/* Tab Navigation */}
            <div style={styles.tabBar}>
                {['overview', 'inventory', 'orders', 'alerts'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab ? styles.tabActive : {}),
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {statusMsg.text && (
                <div style={{
                    ...styles.alert,
                    backgroundColor: statusMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: statusMsg.type === 'success' ? '#059669' : '#DC2626',
                    borderColor: statusMsg.type === 'success' ? '#10B981' : '#EF4444'
                }}>
                    {statusMsg.text}
                </div>
            )}

            {activeTab === 'overview' && (
                <>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Regional Inventory Value</span>
                            <span style={styles.statValue}>{currSymbol}{dashboard?.stats?.inventoryValue?.toLocaleString() || 0}</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Units in Stock</span>
                            <span style={styles.statValue}>{dashboard?.stats?.totalStock?.toLocaleString() || 0}</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Low Stock Alerts</span>
                            <span style={{ ...styles.statValue, color: dashboard?.stats?.lowStockCount > 0 ? '#B45309' : '#111' }}>
                                {dashboard?.stats?.lowStockCount || 0}
                            </span>
                        </div>
                    </div>

                    <div style={styles.contentGrid}>
                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}>Recent Orders ({orders.length})</h2>
                            {orders.length > 0 ? (
                                <div style={styles.tableCard}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Customer</th>
                                                <th style={styles.th}>Address</th>
                                                <th style={styles.th}>Amount</th>
                                                <th style={styles.th}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map(order => (
                                                <tr key={order._id} style={styles.tr}>
                                                    <td style={styles.td}>
                                                        <div style={{ fontWeight: '600' }}>{order.shippingAddress.fullName}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.user?.email}</div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        {order.shippingAddress.city}, {order.shippingAddress.state}
                                                    </td>
                                                    <td style={styles.td}>{currSymbol}{order.totalPrice.toLocaleString()}</td>
                                                    <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p style={styles.empty}>No orders yet in this region.</p>}
                        </section>

                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}>Manual Stock Update</h2>
                            <div style={styles.formCard}>
                                <form onSubmit={handleUpdateStock}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Select Product</label>
                                        <select
                                            value={selectedProduct || ''}
                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                            style={styles.select}
                                            required
                                        >
                                            <option value="">Choose a product...</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>New Stock Level</label>
                                        <input
                                            type="number"
                                            value={newStockValue}
                                            onChange={(e) => setNewStockValue(e.target.value)}
                                            placeholder="Enter quantity"
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <button type="submit" style={styles.actionBtn} disabled={updatingStock}>
                                        {updatingStock ? 'Updating...' : 'Set Stock Level'}
                                    </button>
                                </form>
                            </div>
                        </section>
                    </div>
                </>
            )}

            {activeTab === 'inventory' && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Inventory Control</h2>
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Product</th>
                                    <th style={styles.th}>Current Stock</th>
                                    <th style={styles.th}>Price</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <img src={p.imageUrl} alt="" style={styles.productThumb} />
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.brand} {p.model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.stockBadge,
                                                color: (p.stock[dashboard.region] || 0) < 10 ? '#B45309' : '#059669',
                                                backgroundColor: (p.stock[dashboard.region] || 0) < 10 ? '#FFFBEB' : '#ECFDF5'
                                            }}>
                                                {(p.stock[dashboard.region] || 0)} Units
                                            </span>
                                        </td>
                                        <td style={styles.td}>{currSymbol}{p.pricing[dashboard.region]?.price?.toLocaleString()}</td>
                                        <td style={styles.td}>
                                            <button
                                                style={styles.smallBtn}
                                                onClick={() => {
                                                    setActiveTab('overview');
                                                    setSelectedProduct(p._id);
                                                }}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'orders' && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>All Regional Orders</h2>
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Order ID</th>
                                    <th style={styles.th}>Customer Details</th>
                                    <th style={styles.th}>Shipping Address</th>
                                    <th style={styles.th}>Items</th>
                                    <th style={styles.th}>Total</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} style={styles.tr}>
                                        <td style={{ ...styles.td, fontSize: '0.75rem', color: '#666' }}>#{order._id.slice(-8).toUpperCase()}</td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '600' }}>{order.shippingAddress.fullName}</div>
                                            <div style={{ fontSize: '0.8rem' }}>{order.user?.email}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontSize: '0.85rem' }}>{order.shippingAddress.addressLine1}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            {order.orderItems.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '0.8rem' }}>
                                                    {item.qty}x {item.name} ({item.gripSize})
                                                </div>
                                            ))}
                                        </td>
                                        <td style={styles.td}>{currSymbol}{order.totalPrice.toLocaleString()}</td>
                                        <td style={styles.td}>
                                            <span style={styles.paidBadge}>PAID</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'alerts' && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Critical Stock Alerts</h2>
                    {lowStock?.products?.length > 0 ? (
                        <div style={styles.statsGrid}>
                            {lowStock.products.map(p => (
                                <div key={p._id} style={styles.alertCard}>
                                    <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{p.name}</div>
                                    <div style={{ color: '#EF4444', fontWeight: '800', fontSize: '1.5rem' }}>
                                        {p.stock} Units Left
                                    </div>
                                    <button
                                        style={styles.actionBtn}
                                        onClick={() => {
                                            setActiveTab('overview');
                                            setSelectedProduct(p._id);
                                        }}
                                    >
                                        Restock Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p style={styles.empty}>✅ All stock levels are optimal.</p>}
                </section>
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F7F7F5', // Premium Bone White
        padding: '4rem 6rem',
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4rem',
    },
    title: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#111',
        margin: 0,
        letterSpacing: '-0.02em',
    },
    subtitle: {
        fontSize: '1rem',
        color: '#666',
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center',
    },
    dot: {
        height: '4px',
        width: '4px',
        backgroundColor: '#D1D5DB',
        borderRadius: '50%',
        margin: '0 1rem',
    },
    headerActions: {
        display: 'flex',
        gap: '1rem',
    },
    tabBar: {
        display: 'flex',
        gap: '2.5rem',
        borderBottom: '1px solid #E5E7EB',
        marginBottom: '3rem',
    },
    tab: {
        padding: '1rem 0',
        background: 'none',
        border: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#6B7280',
        cursor: 'pointer',
        position: 'relative',
        transition: 'color 0.2s',
    },
    tabActive: {
        color: '#111',
        fontWeight: '600',
        borderBottom: '2px solid #111',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        marginBottom: '4rem',
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        padding: '2.5rem',
        borderRadius: '1.2rem',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    },
    statLabel: {
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#6B7280',
        fontWeight: '600',
        display: 'block',
        marginBottom: '1rem',
    },
    statValue: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#111',
        fontFamily: "'Playfair Display', serif",
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '1.8fr 1fr',
        gap: '3rem',
    },
    section: {
        marginBottom: '4rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#111',
        marginBottom: '2rem',
        fontFamily: "'Playfair Display', serif",
    },
    tableCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '1.2rem',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '1.2rem 1.5rem',
        backgroundColor: '#F9FAFB',
        color: '#374151',
        fontSize: '0.85rem',
        fontWeight: '600',
        borderBottom: '1px solid #E5E7EB',
    },
    td: {
        padding: '1.2rem 1.5rem',
        fontSize: '0.9rem',
        color: '#111',
        borderBottom: '1px solid #F3F4F6',
    },
    productThumb: {
        width: '40px',
        height: '40px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '1px solid #E5E7EB',
    },
    stockBadge: {
        padding: '0.4rem 0.8rem',
        borderRadius: '2rem',
        fontSize: '0.8rem',
        fontWeight: '700',
    },
    paidBadge: {
        backgroundColor: '#ECFDF5',
        color: '#059669',
        fontSize: '0.75rem',
        fontWeight: '700',
        padding: '0.3rem 0.7rem',
        borderRadius: '4px',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        padding: '2.5rem',
        borderRadius: '1.2rem',
        border: '1px solid #E5E7EB',
        height: 'fit-content',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem',
    },
    select: {
        width: '100%',
        padding: '1rem',
        borderRadius: '0.6rem',
        border: '1px solid #D1D5DB',
        fontSize: '0.95rem',
        color: '#111',
        backgroundColor: '#F9FAFB',
        outline: 'none',
    },
    input: {
        width: '100%',
        padding: '1rem',
        borderRadius: '0.6rem',
        border: '1px solid #D1D5DB',
        fontSize: '0.95rem',
        backgroundColor: '#F9FAFB',
        outline: 'none',
    },
    actionBtn: {
        width: '100%',
        padding: '1.2rem',
        backgroundColor: '#111',
        color: '#FFF',
        border: 'none',
        borderRadius: '0.6rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    smallBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#fff',
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    backBtn: {
        backgroundColor: '#fff',
        border: '1px solid #D1D5DB',
        color: '#111',
        padding: '0.8rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    logoutBtn: {
        backgroundColor: '#FEF2F2',
        border: '1px solid #FEE2E2',
        color: '#DC2626',
        padding: '0.8rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    alert: {
        padding: '1rem 1.5rem',
        borderRadius: '0.8rem',
        border: '1px solid',
        marginBottom: '2rem',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    alertCard: {
        backgroundColor: '#FFFBEB',
        padding: '2rem',
        borderRadius: '1.2rem',
        border: '1px solid #FEF3C7',
        textAlign: 'center',
    },
    empty: {
        color: '#6B7280',
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#FFF',
        borderRadius: '1.2rem',
        border: '1px dotted #D1D5DB',
    },
    loading: {
        fontSize: '1.2rem',
        color: '#6B7280',
        fontFamily: "'Playfair Display', serif",
    }
};

export default AdminDashboard;
