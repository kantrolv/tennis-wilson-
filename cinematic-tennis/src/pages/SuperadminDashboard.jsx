import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const SuperadminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create admin form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        region: 'india',
    });
    const [creating, setCreating] = useState(false);
    const [createMsg, setCreateMsg] = useState(null);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5001/api/superadmin/dashboard', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDashboard(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateMsg(null);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                'http://localhost:5001/api/superadmin/create-admin',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCreateMsg({ type: 'success', text: `✅ Admin created: ${data.email} (${data.region})` });
            setFormData({ name: '', email: '', password: '', region: 'india' });
            // Refresh dashboard to show new admin
            fetchDashboard();
        } catch (err) {
            setCreateMsg({
                type: 'error',
                text: `❌ ${err.response?.data?.message || 'Failed to create admin'}`,
            });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAdmin = async (adminId, adminEmail) => {
        if (!window.confirm(`Are you sure you want to delete admin: ${adminEmail}?`)) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5001/api/superadmin/delete-admin/${adminId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCreateMsg({ type: 'success', text: `✅ Admin '${adminEmail}' deleted successfully` });
            fetchDashboard();
        } catch (err) {
            setCreateMsg({
                type: 'error',
                text: `❌ ${err.response?.data?.message || 'Failed to delete admin'}`,
            });
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading superadmin dashboard...</div>
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
                    <h1 style={styles.title}>Superadmin Dashboard</h1>
                    <p style={styles.subtitle}>Global Control Panel</p>
                </div>
                <button style={styles.backBtn} onClick={() => navigate('/')}>
                    ← Back to Shop
                </button>
            </header>

            {/* Global Stats */}
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
            </div>

            {/* Region Stats */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Region Breakdown</h2>
                <div style={styles.regionGrid}>
                    {dashboard?.regionStats?.map((r) => (
                        <div key={r._id} style={styles.regionCard}>
                            <span style={styles.regionName}>{r._id?.toUpperCase()}</span>
                            <div style={styles.regionStats}>
                                <span>{r.productCount} products</span>
                                <span>{r.totalStock} in stock</span>
                            </div>
                        </div>
                    ))}
                    {(!dashboard?.regionStats || dashboard.regionStats.length === 0) && (
                        <p style={{ color: '#8892b0' }}>No products in any region yet.</p>
                    )}
                </div>
            </section>

            {/* Admin List */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Regional Admins</h2>
                {dashboard?.admins?.length > 0 ? (
                    <div style={styles.adminList}>
                        {dashboard.admins.map((admin) => (
                            <div key={admin._id} style={styles.adminCard}>
                                <div>
                                    <strong style={{ color: '#ccd6f6' }}>{admin.name}</strong>
                                    <p style={{ fontSize: '0.85rem', color: '#8892b0', margin: '0.2rem 0 0' }}>
                                        {admin.email}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={styles.regionBadge}>{admin.region?.toUpperCase()}</span>
                                    <button
                                        onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                                        style={styles.deleteBtn}
                                    >
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

            {/* Create Admin Form */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Create New Admin</h2>
                {createMsg && (
                    <div style={{
                        padding: '0.8rem',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        background: createMsg.type === 'success' ? 'rgba(0,255,100,0.1)' : 'rgba(255,0,0,0.1)',
                        color: createMsg.type === 'success' ? '#00ff64' : '#ff6b6b',
                        border: `1px solid ${createMsg.type === 'success' ? 'rgba(0,255,100,0.2)' : 'rgba(255,0,0,0.2)'}`,
                    }}>
                        {createMsg.text}
                    </div>
                )}
                <form onSubmit={handleCreateAdmin} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Admin Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={styles.input}
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        style={styles.input}
                    />
                    <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        style={styles.input}
                    >
                        <option value="india">India</option>
                        <option value="usa">USA</option>
                        <option value="uk">UK</option>
                        <option value="uae">UAE</option>
                    </select>
                    <button type="submit" style={styles.submitBtn} disabled={creating}>
                        {creating ? 'Creating...' : 'Create Admin'}
                    </button>
                </form>
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
        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: { fontSize: '0.95rem', color: '#8892b0', margin: 0 },
    backBtn: {
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
    section: { marginBottom: '2.5rem' },
    sectionTitle: { fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.2rem', color: '#ccd6f6' },
    regionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
    },
    regionCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '1.2rem',
    },
    regionName: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#f093fb',
        display: 'block',
        marginBottom: '0.5rem',
    },
    regionStats: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        fontSize: '0.85rem',
        color: '#8892b0',
    },
    adminList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
    adminCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '1rem 1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    regionBadge: {
        background: 'rgba(240, 147, 251, 0.15)',
        color: '#f093fb',
        padding: '0.3rem 0.7rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    form: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        maxWidth: '600px',
    },
    input: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        color: '#ccd6f6',
        fontSize: '0.9rem',
        outline: 'none',
    },
    submitBtn: {
        gridColumn: '1 / -1',
        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
        border: 'none',
        borderRadius: '8px',
        padding: '0.8rem',
        color: '#fff',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
    },
    loading: { textAlign: 'center', padding: '4rem', fontSize: '1.1rem', color: '#8892b0' },
    error: { textAlign: 'center', padding: '4rem', fontSize: '1.1rem', color: '#ff6b6b' },
    deleteBtn: {
        background: 'rgba(255, 70, 70, 0.1)',
        border: '1px solid rgba(255, 70, 70, 0.3)',
        color: '#ff6b6b',
        padding: '0.3rem 0.7rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default SuperadminDashboard;
