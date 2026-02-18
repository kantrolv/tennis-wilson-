import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const fromLocation = location.state?.from;
    const from = fromLocation ? `${fromLocation.pathname}${fromLocation.search}` : '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);

            // Role-based redirect after login
            if (data.role === 'superadmin') {
                navigate('/superadmin/dashboard', { replace: true });
            } else if (data.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="auth-page-container">
            {/* Background Decorations */}
            <div className="tennis-bg-line line-1"></div>
            <div className="tennis-bg-line line-2"></div>
            <div className="tennis-bg-line line-3"></div>
            <div className="tennis-bg-line line-4"></div>

            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to access your pro gear.</p>

                {error && (
                    <div className="auth-error">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="auth-button">
                        Sign In
                    </button>

                    <div className="auth-links">
                        <span className="auth-link-text">Don't have an account?</span>
                        <Link to="/signup" className="auth-link">
                            Create Account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
