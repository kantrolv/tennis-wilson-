import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', GBP: '£', AED: 'د.إ', EUR: '€', JPY: '¥', AUD: 'A$' };
const REGION_COLORS = {
    india: '#FF7E67', usa: '#4A90E2', uk: '#00A854', uae: '#F5A623', france: '#8E44AD', germany: '#2C3E50', japan: '#E74C3C', australia: '#F1C40F'
};
const REGION_LABELS = {
    india: '🇮🇳 India', usa: '🇺🇸 United States', uk: '🇬🇧 United Kingdom', uae: '🇦🇪 UAE', france: '🇫🇷 France', germany: '🇩🇪 Germany', japan: '🇯🇵 Japan', australia: '🇦🇺 Australia'
};
const ADMIN_REGION_LABELS = {
    US: '🇺🇸 United States', GB: '🇬🇧 United Kingdom', FR: '🇫🇷 France', DE: '🇩🇪 Germany', JP: '🇯🇵 Japan', AU: '🇦🇺 Australia', IN: '🇮🇳 India', AE: '🇦🇪 UAE'
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

            // Set form to empty, region will be correctly set by the useEffect
            setFormData({ name: '', email: '', password: '', region: '' });
            fetchAll();
        } catch (err) {
            setActionMsg({ type: 'error', text: `❌ ${err.response?.data?.message || 'Failed'}` });
        } finally {
            setCreating(false);
        }
    };

    // Keep formData.region valid based on available regions
    useEffect(() => {
        if (dashboard?.admins) {
            const taken = dashboard.admins.map(a => a.region);
            if (taken.includes(formData.region) || !formData.region) {
                const allRegionVals = ['US', 'GB', 'FR', 'DE', 'JP', 'AU', 'IN', 'AE'];
                const firstAvailable = allRegionVals.find(r => !taken.includes(r)) || '';
                if (formData.region !== firstAvailable) {
                    setFormData(prev => ({ ...prev, region: firstAvailable }));
                }
            }
        }
    }, [dashboard, formData.region]);

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
                                    <span style={{ ...styles.regionName, color: REGION_COLORS[r._id] || '#111' }}>
                                        {REGION_LABELS[r._id] || r._id?.toUpperCase()}
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
                                    title={`${REGION_LABELS[key] || key.toUpperCase()}: ${val.stock} units`}
                                />
                            ))}
                        </div>
                        <div style={styles.legendRow}>
                            {regionEntries.map(([key, val]) => (
                                <div key={key} style={styles.legendItem}>
                                    <span style={{ ...styles.legendDot, background: REGION_COLORS[key] }} />
                                    <span>{REGION_LABELS[key] || key.toUpperCase()} ({Math.round((val.stock / totalGlobalStock) * 100)}%)</span>
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
                                    {REGION_LABELS[key] || key.toUpperCase()}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Stock</span>
                                        <strong style={{ color: '#111' }}>{val.stock?.toLocaleString()}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Value</span>
                                        <strong style={{ color: '#00A854' }}>
                                            {CURRENCY_SYMBOLS[val.currency]}{val.inventoryValue?.toLocaleString()}
                                        </strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Low Stock</span>
                                        <strong style={{ color: val.lowStockCount > 0 ? '#F5A623' : '#111' }}>
                                            {val.lowStockCount}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ ...styles.statCard, marginTop: '1.5rem', textAlign: 'center' }}>
                        <span style={styles.statLabel}>Global Inventory Value (USD equivalent concept)</span>
                        <span style={{ ...styles.statValue, color: '#00A854', fontSize: '2.2rem' }}>
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
                        <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '400', marginLeft: '0.5rem' }}>
                            (threshold: ≤{lowStock.threshold})
                        </span>
                    </h2>

                    {Object.entries(lowStock.lowStockByRegion || {}).map(([region, data]) => (
                        <div key={region} style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: REGION_COLORS[region], fontSize: '1.1rem', marginBottom: '0.8rem' }}>
                                {REGION_LABELS[region] || region.toUpperCase()}
                                <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>
                                    ({data.count} items)
                                </span>
                            </h3>
                            {data.products?.length > 0 ? (
                                <div style={styles.lowStockList}>
                                    {data.products.map(p => (
                                        <div key={p._id} style={{
                                            ...styles.lowStockCard,
                                            borderLeft: `3px solid ${p.status === 'out_of_stock' ? '#E74C3C' : '#F5A623'}`,
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <strong style={{ color: '#111', fontSize: '0.9rem' }}>{p.name}</strong>
                                            </div>
                                            <span style={{
                                                ...styles.stockBadge,
                                                background: p.status === 'out_of_stock' ? 'rgba(231,76,60,0.1)' : 'rgba(245,166,35,0.1)',
                                                color: p.status === 'out_of_stock' ? '#E74C3C' : '#F5A623',
                                            }}>
                                                {p.stock} units
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#00A854', fontSize: '0.85rem' }}>✅ All stocked</p>
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
                            background: actionMsg.type === 'success' ? 'rgba(0, 168, 84, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                            color: actionMsg.type === 'success' ? '#00A854' : '#E74C3C',
                            border: `1px solid ${actionMsg.type === 'success' ? 'rgba(0, 168, 84, 0.2)' : 'rgba(231, 76, 60, 0.2)'}`,
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
                                            <strong style={{ color: '#111' }}>{admin.name}</strong>
                                            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.2rem 0 0' }}>{admin.email}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={styles.regionBadge}>{ADMIN_REGION_LABELS[admin.region] || admin.region?.toUpperCase()}</span>
                                            <button onClick={() => handleDeleteAdmin(admin._id, admin.email)} style={styles.deleteBtn}>
                                                ✕ Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#666' }}>No admins created yet.</p>
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
                                {Object.entries(ADMIN_REGION_LABELS)
                                    .filter(([val]) => !(dashboard?.admins?.map(a => a.region) || []).includes(val))
                                    .map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                    ))}
                                {(!dashboard?.admins ||
                                    ['US', 'GB', 'FR', 'DE', 'JP', 'AU', 'IN', 'AE'].every(r =>
                                        dashboard.admins.map(a => a.region).includes(r)
                                    )) && (
                                        <option value="">No regions available</option>
                                    )}
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
        background: '#F7F7F5',
        color: '#111', fontFamily: "'Inter', sans-serif", padding: '3rem',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '2rem', paddingBottom: '2rem',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: '2.5rem', fontWeight: '700', margin: '0 0 0.5rem 0',
        fontFamily: "'Playfair Display', serif",
        color: '#111', letterSpacing: '-0.02em',
    },
    subtitle: { fontSize: '1rem', color: '#666', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
    backBtn: {
        background: '#fff', border: '1px solid #e0e0e0',
        color: '#111', padding: '0.8rem 1.5rem', borderRadius: '4px',
        cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    tabBar: {
        display: 'flex', gap: '1rem', marginBottom: '3rem',
        borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem',
        flexWrap: 'wrap',
    },
    tab: {
        background: 'transparent', border: 'none', color: '#666',
        padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer',
        fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.3s ease',
    },
    tabActive: { background: '#111', color: '#fff' },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem', marginBottom: '3rem',
    },
    statCard: {
        background: '#fff', border: '1px solid #eaeaea',
        borderRadius: '8px', padding: '2rem',
        display: 'flex', flexDirection: 'column', gap: '0.8rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    },
    statLabel: { fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' },
    statValue: { fontSize: '2.5rem', fontWeight: '700', color: '#111', fontFamily: "'Playfair Display', serif" },
    section: { marginBottom: '3.5rem' },
    sectionTitle: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111', fontFamily: "'Playfair Display', serif" },
    regionGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem',
    },
    regionCard: {
        background: '#fff', border: '1px solid #eaeaea',
        borderRadius: '8px', padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    },
    regionName: {
        fontSize: '1.2rem', fontWeight: '700', display: 'block', marginBottom: '1rem', color: '#111'
    },
    regionStatRow: {
        display: 'flex', justifyContent: 'space-between',
        fontSize: '0.95rem', color: '#444', fontWeight: '500'
    },
    distributionBar: {
        display: 'flex', gap: '4px', height: '32px',
        background: '#e0e0e0', borderRadius: '8px',
        overflow: 'hidden', padding: '4px',
    },
    legendRow: {
        display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap',
    },
    legendItem: {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.9rem', color: '#444', fontWeight: '500'
    },
    legendDot: {
        width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block',
    },
    adminList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    adminCard: {
        background: '#fff', border: '1px solid #eaeaea',
        borderRadius: '8px', padding: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    },
    regionBadge: {
        background: '#f4f4f4', color: '#111', border: '1px solid #e0e0e0',
        padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
    },
    deleteBtn: {
        background: '#fff', border: '1px solid #ff4d4d',
        color: '#ff4d4d', padding: '0.4rem 1rem', borderRadius: '20px',
        fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
    },
    form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '700px', background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #eaeaea' },
    input: {
        background: '#f9f9f9', border: '1px solid #e0e0e0',
        borderRadius: '4px', padding: '1rem', color: '#111',
        fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
    },
    submitBtn: {
        gridColumn: '1 / -1',
        background: '#111', border: 'none',
        borderRadius: '4px', padding: '1rem', color: '#fff',
        fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s'
    },
    lowStockList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    lowStockCard: {
        background: '#fff', border: '1px solid #eaeaea',
        borderRadius: '8px', padding: '1.2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    stockBadge: {
        padding: '0.4rem 1rem', borderRadius: '20px',
        fontSize: '0.85rem', fontWeight: '600',
    },
    loading: { textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: '#666' },
    error: { textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: '#ff4d4d' },
};

export default SuperadminDashboard;
