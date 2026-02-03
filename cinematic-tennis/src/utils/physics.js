import * as THREE from 'three';

// Frame-rate independent damping
// t = target, p = current, lambda = speed, dt = delta time
export function damp(current, target, lambda, dt) {
    return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}
