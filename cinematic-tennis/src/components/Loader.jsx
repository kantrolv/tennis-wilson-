import { useProgress } from '@react-three/drei';

export function Loader() {
    const { progress } = useProgress();

    if (progress === 100) return null;

    return (
        <div className="loader" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: '#050505', color: '#f5f5f0',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999, transition: 'opacity 0.5s ease-out'
        }}>
            <div style={{ fontFamily: '"Inter", sans-serif', letterSpacing: '0.2em' }}>
                LOADING {Math.floor(progress)}%
            </div>
        </div>
    );
}
