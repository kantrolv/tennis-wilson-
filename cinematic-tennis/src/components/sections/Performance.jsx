import React from 'react';

const Performance = () => {
    const metrics = [
        { label: 'Control', value: 95 },
        { label: 'Power', value: 75 },
        { label: 'Comfort', value: 85 },
        { label: 'Spin', value: 90 },
    ];

    return (
        <section className="section align-center" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-hero" style={{ color: '#1a1a1a' }}>Let the racket disappear.</h2>
            <p className="text-sub" style={{ marginBottom: '4rem', color: '#555' }}>
                Only the shot remains. Calibrated for the modern game.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {metrics.map((m) => (
                    <div key={m.label} className="performance-card" style={{ textAlign: 'left' }}>
                        <span className="perf-watermark">{m.value}</span>
                        <div className="perf-content">
                            <div className="perf-header">
                                <span className="perf-label">{m.label}</span>
                                <span className="perf-value">{m.value}<span className="perf-value-sub">/100</span></span>
                            </div>
                            <div className="perf-track">
                                <div className="perf-fill" style={{ width: `${m.value}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Performance;
