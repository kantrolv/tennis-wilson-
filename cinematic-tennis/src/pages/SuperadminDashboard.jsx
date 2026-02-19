import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', GBP: '£', AED: 'د.إ' };
const REGION_COLORS = {
    india: '#f093fb', usa: '#667eea', uk: '#00c864', uae: '#ffa726',
};

const SuperadminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [lowStock, setLowStock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Create admin form
    const [formData, setFormData] = useState({ name: '', email: '', password: '', region: 'US' });
    const [creating, setCreating] = useState(false);
    const [actionMsg, setActionMsg] = useState(null);

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const fetchAll = async () => {
        try {
            const [dashRes, analyticsRes, lowStockRes] = await Promise.all([
                axios.get('http://localhost:5001/api/superadmin/dashboard', authHeader),
                axios.get('http://localhost:5001/api/superadmin/analytics', authHeader),
                axios.get('http://localhost:5001/api/superadmin/low-stock', authHeader),
            ]);
            setDashboard(dashRes.data);
            setAnalytics(analyticsRes.data.analytics);
            setLowStock(lowStockRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setCreating(true);
        setActionMsg(null);
        try {
            const { data } = await axios.post('http://localhost:5001/api/superadmin/create-admin', formData, authHeader);
            setActionMsg({ type: 'success', text: `✅ Admin created: ${data.email} (${data.region})` });
            setFormData({ name: '', email: '', password: '', region: 'US' });
            fetchAll();
        } catch (err) {
            setActionMsg({ type: 'error', text: `❌ ${err.response?.data?.message || 'Failed'}` });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAdmin = async (id, email) => {
        if (!window.confirm(`Delete admin: ${email}?`)) return;
        try {
            await axios.delete(`http://localhost:5001/api/superadmin/delete-admin/${id}`, authHeader);
            setActionMsg({ type: 'success', text: `✅ Admin '${email}' deleted` });
            fetchAll();
        } catch (err) {
            setActionMsg({ type: 'error', text: `❌ ${err.response?.data?.message || 'Failed'}` });
        }
    };

    if (loading) return <div style={styles.container}><div style={styles.loading}>Loading superadmin dashboard...</div></div>;
    if (error) return <div style={styles.container}><div style={styles.error}>❌ {error}</div></div>;

    // Stock distribution bar data
    const totalGlobalStock = analytics?.globalStock || 1;
    const regionEntries = analytics?.regions ? Object.entries(analytics.regions) : [];

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Superadmin Dashboard</h1>
                    <p style={styles.subtitle}>Global Control Panel</p>
                </div>
                <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Shop</button>
            </header>

            {/* Tab Navigation */}
            <div style={styles.tabBar}>
                {['overview', 'analytics', 'low-stock', 'admins'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                    >
                        {tab === 'overview' ? '🏠 Overview' :
                            tab === 'analytics' ? '📊 Analytics' :
                                tab === 'low-stock' ? '⚠️ Alerts' :
                                    '👥 Admins'}
                    </button>
                ))}
            </div>

            {/* ─── OVERVIEW TAB ────────────────────────────── */}
            {activeTab === 'overview' && (
                <>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Total Users</span>
                            <span style={styles.statValue}>{dashboard?.stats?.totalUsers || 0}</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Total Admins</span>
                            <span style={styles.statValue}>{dashboard?.stats?.totalAdmins || 0}</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Total Products</span>
                            <span style={styles.statValue}>{dashboard?.stats?.totalProducts || 0}</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statLabel}>Global Stock</span>
                            <span style={styles.statValue}>{analytics?.globalStock?.toLocaleString() || 0}</span>
                        </div>
                    </div>

                    {/* Region Breakdown Cards */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Region Breakdown</h2>
                        <div style={styles.regionGrid}>
                            {dashboard?.regionStats?.map(r => (
                                <div key={r._id} style={styles.regionCard}>
                                    <span style={{ ...styles.regionName, color: REGION_COLORS[r._id] || '#f093fb' }}>
                                        {r._id?.toUpperCase()}
                                    </span>
                                    <div style={styles.regionStatRow}>
                                        <span>{r.totalStock?.toLocaleString()} units</span>
                                        <span>{CURRENCY_SYMBOLS[r.currency]}{r.inventoryValue?.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stock Distribution Bar */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Stock Distribution</h2>
                        <div style={styles.distributionBar}>
                            {regionEntries.map(([key, val]) => (
                                <div
                                    key={key}
                                    style={{
                                        width: `${Math.max((val.stock / totalGlobalStock) * 100, 2)}%`,
                                        background: REGION_COLORS[key],
                                        height: '100%',
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease',
                                    }}
                                    title={`${key.toUpperCase()}: ${val.stock} units`}
                                />
                            ))}
                        </div>
                        <div style={styles.legendRow}>
                            {regionEntries.map(([key, val]) => (
                                <div key={key} style={styles.legendItem}>
                                    <span style={{ ...styles.legendDot, background: REGION_COLORS[key] }} />
                                    <span>{key.toUpperCase()} ({Math.round((val.stock / totalGlobalStock) * 100)}%)</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}

            {/* ─── ANALYTICS TAB ───────────────────────────── */}
            {activeTab === 'analytics' && analytics && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Inventory Value by Region</h2>
                    <div style={styles.regionGrid}>
                        {regionEntries.map(([key, val]) => (
                            <div key={key} style={{
                                ...styles.regionCard,
                                borderLeft: `3px solid ${REGION_COLORS[key]}`,
                            }}>
                                <span style={{ ...styles.regionName, color: REGION_COLORS[key] }}>
                                    {key.toUpperCase()}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#8892b0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Stock</span>
                                        <strong style={{ color: '#ccd6f6' }}>{val.stock?.toLocaleString()}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Value</span>
                                        <strong style={{ color: '#00c864' }}>
                                            {CURRENCY_SYMBOLS[val.currency]}{val.inventoryValue?.toLocaleString()}
                                        </strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Low Stock</span>
                                        <strong style={{ color: val.lowStockCount > 0 ? '#ffa726' : '#ccd6f6' }}>
                                            {val.lowStockCount}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ ...styles.statCard, marginTop: '1.5rem', textAlign: 'center' }}>
                        <span style={styles.statLabel}>Global Inventory Value (USD equivalent concept)</span>
                        <span style={{ ...styles.statValue, color: '#00c864', fontSize: '2.2rem' }}>
                            ${analytics.globalInventoryValue?.toLocaleString()}
                        </span>
                    </div>
                </section>
            )}

            {/* ─── LOW STOCK TAB ───────────────────────────── */}
            {activeTab === 'low-stock' && lowStock && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        ⚠️ Low Stock Alerts
                        <span style={{ fontSize: '0.8rem', color: '#8892b0', fontWeight: '400', marginLeft: '0.5rem' }}>
                            (threshold: ≤{lowStock.threshold})
                        </span>
                    </h2>

                    {Object.entries(lowStock.lowStockByRegion || {}).map(([region, data]) => (
                        <div key={region} style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: REGION_COLORS[region], fontSize: '1.1rem', marginBottom: '0.8rem' }}>
                                {region.toUpperCase()}
                                <span style={{ fontSize: '0.8rem', color: '#8892b0', marginLeft: '0.5rem' }}>
                                    ({data.count} items)
                                </span>
                            </h3>
                            {data.products?.length > 0 ? (
                                <div style={styles.lowStockList}>
                                    {data.products.map(p => (
                                        <div key={p._id} style={{
                                            ...styles.lowStockCard,
                                            borderLeft: `3px solid ${p.status === 'out_of_stock' ? '#ff6b6b' : '#ffa726'}`,
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <strong style={{ color: '#ccd6f6', fontSize: '0.9rem' }}>{p.name}</strong>
                                            </div>
                                            <span style={{
                                                ...styles.stockBadge,
                                                background: p.status === 'out_of_stock' ? 'rgba(255,70,70,0.15)' : 'rgba(255,167,38,0.15)',
                                                color: p.status === 'out_of_stock' ? '#ff6b6b' : '#ffa726',
                                            }}>
                                                {p.stock} units
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#00c864', fontSize: '0.85rem' }}>✅ All stocked</p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* ─── ADMINS TAB ──────────────────────────────── */}
            {activeTab === 'admins' && (
                <>
                    {actionMsg && (
                        <div style={{
                            padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px',
                            background: actionMsg.type === 'success' ? 'rgba(0,255,100,0.1)' : 'rgba(255,0,0,0.1)',
                            color: actionMsg.type === 'success' ? '#00ff64' : '#ff6b6b',
                            border: `1px solid ${actionMsg.type === 'success' ? 'rgba(0,255,100,0.2)' : 'rgba(255,0,0,0.2)'}`,
                        }}>
                            {actionMsg.text}
                        </div>
                    )}

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Regional Admins</h2>
                        {dashboard?.admins?.length > 0 ? (
                            <div style={styles.adminList}>
                                {dashboard.admins.map(admin => (
                                    <div key={admin._id} style={styles.adminCard}>
                                        <div>
                                            <strong style={{ color: '#ccd6f6' }}>{admin.name}</strong>
                                            <p style={{ fontSize: '0.85rem', color: '#8892b0', margin: '0.2rem 0 0' }}>{admin.email}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={styles.regionBadge}>{admin.region?.toUpperCase()}</span>
                                            <button onClick={() => handleDeleteAdmin(admin._id, admin.email)} style={styles.deleteBtn}>
                                                ✕ Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#8892b0' }}>No admins created yet.</p>
                        )}
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Create New Admin</h2>
                        <form onSubmit={handleCreateAdmin} style={styles.form}>
                            <input type="text" placeholder="Admin Name" value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
                            <input type="email" placeholder="Email Address" value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })} required style={styles.input} />
                            <input type="password" placeholder="Password" value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })} required style={styles.input} />
                            <select value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} style={styles.input}>
                                <option value="US">🇺🇸 United States</option>
                                <option value="GB">🇬🇧 United Kingdom</option>
                                <option value="FR">🇫🇷 France</option>
                                <option value="DE">🇩🇪 Germany</option>
                                <option value="JP">🇯🇵 Japan</option>
                                <option value="AU">🇦🇺 Australia</option>
                                <option value="IN">🇮🇳 India</option>
                                <option value="AE">🇦🇪 UAE</option>
                            </select>
                            <button type="submit" style={styles.submitBtn} disabled={creating}>
                                {creating ? 'Creating...' : 'Create Admin'}
                            </button>
                        </form>
                    </section>
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#ffffff', fontFamily: "'Inter', sans-serif", padding: '2rem',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '1.5rem', paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0',
        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    subtitle: { fontSize: '0.95rem', color: '#8892b0', margin: 0 },
    backBtn: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#ccd6f6', padding: '0.6rem 1.2rem', borderRadius: '8px',
        cursor: 'pointer', fontSize: '0.9rem',
    },
    tabBar: {
        display: 'flex', gap: '0.5rem', marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem',
        flexWrap: 'wrap',
    },
    tab: {
        background: 'transparent', border: 'none', color: '#8892b0',
        padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
        fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s',
    },
    tabActive: { background: 'rgba(240, 147, 251, 0.15)', color: '#f093fb' },
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
    regionGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem',
    },
    regionCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', padding: '1.2rem',
    },
    regionName: {
        fontSize: '1.1rem', fontWeight: '700', display: 'block', marginBottom: '0.8rem',
    },
    regionStatRow: {
        display: 'flex', justifyContent: 'space-between',
        fontSize: '0.85rem', color: '#8892b0',
    },
    distributionBar: {
        display: 'flex', gap: '3px', height: '24px',
        background: 'rgba(255,255,255,0.05)', borderRadius: '6px',
        overflow: 'hidden', padding: '3px',
    },
    legendRow: {
        display: 'flex', gap: '1.5rem', marginTop: '0.8rem', flexWrap: 'wrap',
    },
    legendItem: {
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.8rem', color: '#8892b0',
    },
    legendDot: {
        width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block',
    },
    adminList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
    adminCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', padding: '1rem 1.2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    regionBadge: {
        background: 'rgba(240, 147, 251, 0.15)', color: '#f093fb',
        padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
    },
    deleteBtn: {
        background: 'rgba(255, 70, 70, 0.1)', border: '1px solid rgba(255, 70, 70, 0.3)',
        color: '#ff6b6b', padding: '0.3rem 0.7rem', borderRadius: '6px',
        fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
    },
    form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '600px' },
    input: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px', padding: '0.75rem 1rem', color: '#ccd6f6',
        fontSize: '0.9rem', outline: 'none',
    },
    submitBtn: {
        gridColumn: '1 / -1',
        background: 'linear-gradient(135deg, #f093fb, #f5576c)', border: 'none',
        borderRadius: '8px', padding: '0.8rem', color: '#fff',
        fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer',
    },
    lowStockList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    lowStockCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '0.8rem 1rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    stockBadge: {
        padding: '0.3rem 0.7rem', borderRadius: '6px',
        fontSize: '0.8rem', fontWeight: '600',
    },
    loading: { textAlign: 'center', padding: '4rem', fontSize: '1.1rem', color: '#8892b0' },
    error: { textAlign: 'center', padding: '4rem', fontSize: '1.1rem', color: '#ff6b6b' },
};

export default SuperadminDashboard;
