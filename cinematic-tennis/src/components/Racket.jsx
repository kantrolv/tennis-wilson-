import { useGLTF } from '@react-three/drei';
import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { scrollState } from '../hooks/useScroll';
import * as THREE from 'three';
import { damp } from '../utils/physics';

export function Racket(props) {
    const { scene } = useGLTF('/racket.glb');
    const group = useRef();
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    // Position the handle specifically for the macro shot
    // We might need to adjust the pivot point or just rely on the parent group in Experience

    useFrame((state, delta) => {
        // Logic moved to Experience.jsx for centralized choreography
    });

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={clonedScene} />
        </group>
    );
}

useGLTF.preload('/racket.glb');
