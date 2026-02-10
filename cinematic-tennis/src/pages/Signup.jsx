import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);

    const { signup, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            await signup(name, email, password);
            navigate('/');
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
                <h1 className="auth-title">Join the Team</h1>
                <p className="auth-subtitle">Create an account to track your orders.</p>

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

                    <button type="submit" className="auth-button">
                        Sign Up
                    </button>

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
