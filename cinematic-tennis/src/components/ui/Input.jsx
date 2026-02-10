import React from 'react';

const Input = ({ label, type, value, onChange, required, placeholder, className = '' }) => {
    return (
        <div className={`auth-input-group ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'var(--font-sans)', color: 'var(--c-text-muted)' }}>
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--c-gold)] transition-colors placeholder-gray-500"
                style={{
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'var(--font-sans)'
                }}
            />
        </div>
    );
};

export default Input;
