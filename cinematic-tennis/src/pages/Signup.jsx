import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const REGION_OPTIONS = [
    { code: 'US', flag: '🇺🇸', name: 'United States', currency: 'USD ($)' },
    { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', currency: 'GBP (£)' },
    { code: 'FR', flag: '🇫🇷', name: 'France', currency: 'EUR (€)' },
    { code: 'DE', flag: '🇩🇪', name: 'Germany', currency: 'EUR (€)' },
    { code: 'JP', flag: '🇯🇵', name: 'Japan', currency: 'JPY (¥)' },
    { code: 'AU', flag: '🇦🇺', name: 'Australia', currency: 'AUD (A$)' },
    { code: 'IN', flag: '🇮🇳', name: 'India', currency: 'INR (₹)' },
    { code: 'AE', flag: '🇦🇪', name: 'UAE', currency: 'AED (د.إ)' },
];

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('US');
    const [message, setMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { signup, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        if (!selectedRegion) {
            setMessage('Please select your region');
            return;
        }

        setSubmitting(true);
        try {
            await signup(name, email, password, selectedRegion);
            navigate('/');
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
                <h1 className="auth-title">Join the Team</h1>
                <p className="auth-subtitle">Create an account to track your orders.</p>

                <div className="auth-notice">
                    <span className="auth-notice__icon">☕</span>
                    <span>
                        <strong>Heads up:</strong> this demo runs on free hosting, so the
                        server may take <strong>2–3 minutes to wake up</strong> on your first
                        request. Thanks for your patience!
                    </span>
                </div>

                {message && (
                    <div className="auth-error">
                        <span>⚠️ {message}</span>
                    </div>
                )}
                {error && (
                    <div className="auth-error">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label className="auth-label">Full Name</label>
                        <input
                            type="text"
                            className="auth-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Roger Federer"
                        />
                    </div>

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
                        <label className="auth-label">Your Region</label>
                        <div className="region-selector-grid">
                            {REGION_OPTIONS.map((r) => (
                                <div
                                    key={r.code}
                                    className={`region-option ${selectedRegion === r.code ? 'region-option--selected' : ''}`}
                                    onClick={() => setSelectedRegion(r.code)}
                                >
                                    <span className="region-flag">{r.flag}</span>
                                    <span className="region-name">{r.name}</span>
                                    <span className="region-currency">{r.currency}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a password"
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Confirm Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm password"
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={submitting}>
                        {submitting ? (
                            <span className="auth-button__loading">
                                <span className="auth-spinner" />
                                Waking the server… hang tight
                            </span>
                        ) : (
                            'Sign Up'
                        )}
                    </button>

                    {submitting && (
                        <p className="auth-waking-note">
                            Free hosting spins the backend down when idle — first request
                            can take up to 2–3 minutes. Please don't refresh.
                        </p>
                    )}

                    <div className="auth-links">
                        <span className="auth-link-text">Already have an account?</span>
                        <Link to="/login" className="auth-link">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
