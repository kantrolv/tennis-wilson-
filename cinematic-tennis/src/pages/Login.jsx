import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const fromLocation = location.state?.from;
    const from = fromLocation ? `${fromLocation.pathname}${fromLocation.search}` : '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
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
            setSubmitting(false);
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

                <div className="auth-notice">
                    <span className="auth-notice__icon">☕</span>
                    <span>
                        <strong>Heads up:</strong> this demo runs on free hosting, so the
                        server may take <strong>2–3 minutes to wake up</strong> on the first
                        sign in. Thanks for your patience!
                    </span>
                </div>

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

                    <button type="submit" className="auth-button" disabled={submitting}>
                        {submitting ? (
                            <span className="auth-button__loading">
                                <span className="auth-spinner" />
                                Waking the server… hang tight
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {submitting && (
                        <p className="auth-waking-note">
                            Free hosting spins the backend down when idle — first request
                            can take up to 2–3 minutes. Please don't refresh.
                        </p>
                    )}

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
