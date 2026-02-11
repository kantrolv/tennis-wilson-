import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const { region, changeRegion, regions } = useRegion();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '100px 20px', color: 'var(--c-ivory)', minHeight: '100vh', background: 'var(--c-bg-main)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>My Profile</h1>

                {user && (
                    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Account Details</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="btn-primary"
                            style={{
                                marginTop: '2rem',
                                background: 'transparent',
                                border: '1px solid #cf102d',
                                color: '#cf102d',
                                padding: '0.5rem 1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = '#cf102d'; e.target.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#cf102d'; }}
                        >
                            Logout
                        </button>
                    </div>
                )}

                <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Region Settings</h2>
                    <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Select your region to see accurate pricing and availability.</p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {regions.map((r) => (
                            <button
                                key={r.code}
                                onClick={() => changeRegion(r.code)}
                                style={{
                                    background: region.countryCode === r.code ? 'var(--c-gold-dim, rgba(212, 175, 55, 0.2))' : 'rgba(255,255,255,0.05)',
                                    border: region.countryCode === r.code ? '1px solid var(--c-gold, #d4af37)' : '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--c-ivory)',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>
                                    {getFlagEmoji(r.code)}
                                </span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{r.curr} ({r.symbol})</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Flag Helper
function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

export default Profile;
