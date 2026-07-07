import * as THREE from 'three';

// Frame-rate independent damping (first-order low-pass).
// Pure ease-out: reacts at max speed then decelerates. Kept for simple uses.
// t = target, p = current, lambda = speed, dt = delta time
export function damp(current, target, lambda, dt) {
    return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

// Critically-damped spring (Unity-style Mathf.SmoothDamp).
//
// Unlike `damp`, this is a SECOND-ORDER system: it carries velocity between
// frames, so it eases smoothly BOTH into and out of motion (no leading-edge
// snap) and never overshoots. This is what makes scroll-driven motion read as
// "smooth at every point" and physically real.
//
//   current    – current value
//   target     – value to approach
//   vel        – a mutable object holding per-channel velocity state
//   key        – property name on `vel` for this channel's velocity
//   smoothTime – approx. time (seconds) to reach the target; smaller = snappier
//   dt         – delta time (clamp this upstream to avoid spikes)
//   maxSpeed   – optional clamp on velocity
//
// Returns the new value AND writes the updated velocity back to vel[key].
export function smoothDamp(current, target, vel, key, smoothTime, dt, maxSpeed = Infinity) {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;

    const x = omega * dt;
    // Rational approximation of e^-x — cheap and stable.
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    const originalTo = target;
    let change = current - target;

    // Clamp maximum speed
    const maxChange = maxSpeed * smoothTime;
    change = THREE.MathUtils.clamp(change, -maxChange, maxChange);
    target = current - change;

    let v = vel[key] || 0;
    const temp = (v + omega * change) * dt;
    v = (v - omega * temp) * exp;
    let output = target + (change + temp) * exp;

    // Prevent overshoot past the target
    if ((originalTo - current > 0) === (output > originalTo)) {
        output = originalTo;
        v = (output - originalTo) / dt;
    }

    vel[key] = v;
    return output;
}
