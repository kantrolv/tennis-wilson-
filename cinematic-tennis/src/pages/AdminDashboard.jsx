import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:5001/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDashboard(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>❌ {error}</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Admin Dashboard</h1>
                    <p style={styles.subtitle}>
                        Region: <span style={styles.badge}>{dashboard?.region?.toUpperCase()}</span>
                    </p>
                </div>
                <button style={styles.logoutBtn} onClick={() => navigate('/')}>
                    ← Back to Shop
                </button>
            </header>

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Total Products</span>
                    <span style={styles.statValue}>{dashboard?.stats?.totalProducts || 0}</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Total Stock</span>
                    <span style={styles.statValue}>{dashboard?.stats?.totalStock || 0}</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Your Role</span>
                    <span style={styles.statValue}>{dashboard?.role?.toUpperCase()}</span>
                </div>
            </div>

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
                        <h3 style={styles.actionTitle}>📋 View Products</h3>
                        <p style={styles.actionDesc}>Browse your region's catalog</p>
                    </div>
                </div>
            </section>
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        margin: '0 0 0.5rem 0',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: { fontSize: '0.95rem', color: '#8892b0', margin: 0 },
    badge: {
        background: 'rgba(102, 126, 234, 0.2)',
        color: '#667eea',
        padding: '0.2rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600',
    },
    logoutBtn: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#ccd6f6',
        padding: '0.6rem 1.2rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
    },
    statCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    statLabel: { fontSize: '0.85rem', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em' },
    statValue: { fontSize: '2rem', fontWeight: '700', color: '#ccd6f6' },
    section: { marginTop: '1rem' },
    sectionTitle: { fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.2rem', color: '#ccd6f6' },
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem',
    },
    actionCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    actionTitle: { fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.4rem 0', color: '#ccd6f6' },
    actionDesc: { fontSize: '0.85rem', color: '#8892b0', margin: 0 },
    loading: { textAlign: 'center', padding: '4rem', fontSize: '1.1rem', color: '#8892b0' },
    error: { textAlign: 'center', padding: '4rem', fontSize: '1.1rem', color: '#ff6b6b' },
};

export default AdminDashboard;
