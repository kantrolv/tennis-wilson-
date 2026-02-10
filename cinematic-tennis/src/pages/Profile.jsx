import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '100px 20px', color: 'var(--c-ivory)', minHeight: '100vh', background: 'var(--c-bg-main)' }}>
            <h1>My Profile</h1>
            {user && (
                <div className="glass-panel" style={{ marginTop: '20px', maxWidth: '600px' }}>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>

                    <button
                        onClick={handleLogout}
                        className="btn-primary"
                        style={{ marginTop: '20px', background: '#cf102d', color: 'white' }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;
