import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', GBP: '£', AED: 'د.إ' };

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [lowStock, setLowStock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        try {
            const [dashRes, lowStockRes] = await Promise.all([
                axios.get('http://localhost:5001/api/admin/dashboard', authHeader),
                axios.get('http://localhost:5001/api/admin/low-stock', authHeader),
            ]);
            setDashboard(dashRes.data);
            setLowStock(lowStockRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return <div style={styles.container}><div style={styles.loading}>Loading dashboard...</div></div>;
    if (error) return <div style={styles.container}><div style={styles.error}>❌ {error}</div></div>;

    const currSymbol = CURRENCY_SYMBOLS[dashboard?.currency] || '$';

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Admin Dashboard</h1>
                    <p style={styles.subtitle}>
                        Region: <span style={styles.badge}>{dashboard?.region?.toUpperCase()}</span>
                        {' '}
                        <span style={{ ...styles.badge, background: 'rgba(0,200,100,0.15)', color: '#00c864' }}>
                            {dashboard?.currency}
                        </span>
                    </p>
                </div>
                <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Shop</button>
            </header>

            {/* Tab Navigation */}
            <div style={styles.tabBar}>
                {['overview', 'low-stock'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab ? styles.tabActive : {}),
                        }}
                    >
                        {tab === 'overview' ? '📊 Overview' : '⚠️ Low Stock Alerts'}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Stats Cards */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Total Products</span>
                            <span style={styles.statValue}>{dashboard?.stats?.totalProducts || 0}</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Total Stock</span>
                            <span style={styles.statValue}>{dashboard?.stats?.totalStock?.toLocaleString() || 0}</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Inventory Value</span>
                            <span style={{ ...styles.statValue, color: '#00c864' }}>
                                {currSymbol}{dashboard?.stats?.inventoryValue?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Low Stock Items</span>
                            <span style={{ ...styles.statValue, color: dashboard?.stats?.lowStockCount > 0 ? '#ffa726' : '#ccd6f6' }}>
                                {dashboard?.stats?.lowStockCount || 0}
                            </span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Out of Stock</span>
                            <span style={{ ...styles.statValue, color: dashboard?.stats?.outOfStockCount > 0 ? '#ff6b6b' : '#ccd6f6' }}>
                                {dashboard?.stats?.outOfStockCount || 0}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Quick Actions</h2>
                        <div style={styles.actionsGrid}>
                            <div style={styles.actionCard}>
                                <h3 style={styles.actionTitle}>📦 Add Product</h3>
                                <p style={styles.actionDesc}>Add a new product to your region</p>
                            </div>
                            <div style={styles.actionCard}>
                                <h3 style={styles.actionTitle}>📊 Update Stock</h3>
                                <p style={styles.actionDesc}>Manage inventory levels</p>
                            </div>
                            <div style={styles.actionCard}>
                                <h3 style={styles.actionTitle}>💰 Update Pricing</h3>
                                <p style={styles.actionDesc}>Manage regional pricing</p>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {activeTab === 'low-stock' && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        ⚠️ Low Stock Alerts
                        <span style={{ fontSize: '0.8rem', color: '#8892b0', fontWeight: '400', marginLeft: '0.5rem' }}>
                            (threshold: ≤{lowStock?.threshold})
                        </span>
                    </h2>

                    {lowStock?.products?.length > 0 ? (
                        <div style={styles.lowStockList}>
                            {lowStock.products.map(p => (
                                <div key={p._id} style={{
                                    ...styles.lowStockCard,
                                    borderLeft: `3px solid ${p.status === 'out_of_stock' ? '#ff6b6b' : '#ffa726'}`,
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <strong style={{ color: '#ccd6f6' }}>{p.name}</strong>
                                        <p style={{ fontSize: '0.8rem', color: '#8892b0', margin: '0.2rem 0 0' }}>
                                            {currSymbol}{p.price?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            ...styles.stockBadge,
                                            background: p.status === 'out_of_stock' ? 'rgba(255,70,70,0.15)' : 'rgba(255,167,38,0.15)',
                                            color: p.status === 'out_of_stock' ? '#ff6b6b' : '#ffa726',
                                        }}>
                                            {p.stock} units
                                        </span>
                                        <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                                            {p.status === 'out_of_stock' ? '🔴 Out of Stock' : '🟠 Low Stock'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#00c864' }}>
                            ✅ All products are well stocked!
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        padding: '2rem',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '1.5rem', paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    subtitle: { fontSize: '0.95rem', color: '#8892b0', margin: 0 },
    badge: {
        background: 'rgba(102, 126, 234, 0.2)', color: '#667eea',
        padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600',
    },
    backBtn: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#ccd6f6', padding: '0.6rem 1.2rem', borderRadius: '8px',
        cursor: 'pointer', fontSize: '0.9rem',
    },
    tabBar: {
        display: 'flex', gap: '0.5rem', marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem',
    },
    tab: {
        background: 'transparent', border: 'none', color: '#8892b0',
        padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
        fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s',
    },
    tabActive: {
        background: 'rgba(102, 126, 234, 0.15)', color: '#667eea',
    },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.2rem', marginBottom: '2.5rem',
    },
    statCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
    },
    statLabel: { fontSize: '0.8rem', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em' },
    statValue: { fontSize: '1.8rem', fontWeight: '700', color: '#ccd6f6' },
    section: { marginBottom: '2.5rem' },
    sectionTitle: { fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.2rem', color: '#ccd6f6' },
    actionsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem',
    },
    actionCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s ease',
    },
    actionTitle: { fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.4rem 0', color: '#ccd6f6' },
    actionDesc: { fontSize: '0.85rem', color: '#8892b0', margin: 0 },
    lowStockList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
    lowStockCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '1rem 1.2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    stockBadge: {
        padding: '0.3rem 0.7rem', borderRadius: '6px',
        fontSize: '0.85rem', fontWeight: '600',
    },
    loading: { textAlign: 'center', padding: '4rem', fontSize: '1.1rem', color: '#8892b0' },
    error: { textAlign: 'center', padding: '4rem', fontSize: '1.1rem', color: '#ff6b6b' },
};

export default AdminDashboard;
