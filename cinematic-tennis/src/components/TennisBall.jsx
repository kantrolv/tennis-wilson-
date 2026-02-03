import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { scrollState } from '../hooks/useScroll';
import * as THREE from 'three';
import { damp } from '../utils/physics';

export function TennisBall(props) {
    const { scene } = useGLTF('/tennis_ball.glb');
    const group = useRef();

    // Clone to avoid mutation if we ever duplicate
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useFrame((state, delta) => {
        // Logic moved to Experience.jsx for centralized choreography
    });

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={clonedScene} />
        </group>
    );
}

useGLTF.preload('/tennis_ball.glb');
