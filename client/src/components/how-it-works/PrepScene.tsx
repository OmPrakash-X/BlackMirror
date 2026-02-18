import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

export default function PrepScene() {
    const groupRef = useRef<THREE.Group>(null!);
    const redRef = useRef<THREE.Group>(null!);
    const greenRef = useRef<THREE.Group>(null!);
    const blueRef = useRef<THREE.Group>(null!);
    const t = useRef(0);

    useFrame((_, delta) => {
        t.current += delta;
        const cycle = t.current % 5; // 5-second loop

        // ── Animation Schedule ──
        // 0s - 2s: Channels merge (slide in)
        // 2s - 2.5s: Pause fully merged
        // 2.5s - 3.5s: Resize (Scale down)
        // 3.5s - 5s: Reset / Pop out

        // 1. Merge Factor (0 = apart, 1 = together)
        let merge = 0;
        if (cycle < 2) {
            merge = THREE.MathUtils.smoothstep(cycle, 0, 2);
        } else {
            merge = 1;
        }

        // 2. Scale Factor (1 = full size, 0.6 = normalized 224x224)
        let scale = 1;
        if (cycle > 2.5 && cycle < 4) {
            scale = THREE.MathUtils.smoothstep(cycle, 2.5, 3.5);
            scale = 1 - scale * 0.45; // 1 -> 0.55
        } else if (cycle >= 4) {
            // Quick reset
            const reset = THREE.MathUtils.smoothstep(cycle, 4, 5);
            scale = 0.55 + reset * 0.45;
            merge = 1 - reset; // Pull apart as we scale up
        }

        // Apply positions
        if (redRef.current) redRef.current.position.x = -2.8 * (1 - merge);
        if (blueRef.current) blueRef.current.position.x = 2.8 * (1 - merge);

        // Apply global group scale (Resize effect)
        if (groupRef.current) {
            groupRef.current.scale.setScalar(scale);
            // Gentle floating
            groupRef.current.rotation.y = Math.sin(t.current * 0.4) * 0.1;
            groupRef.current.rotation.z = Math.cos(t.current * 0.3) * 0.05;
        }
    });

    // Reusable Card Component representing an image channel
    const ChannelCard = ({ color, refProp, zOffset }: { color: string; refProp: any; zOffset: number }) => (
        <group ref={refProp} position={[0, 0, zOffset]}>
            {/* Glass Pane */}
            <mesh>
                <boxGeometry args={[2.2, 2.6, 0.04]} />
                <meshStandardMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Bright Border Frame */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.25, 2.7, 0.02]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} wireframe />
            </mesh>
            {/* "Content" - Abstract Face to show it's an image */}
            <group position={[0, 0, 0.03]}>
                {/* Head */}
                <mesh position={[0, 0.4, 0]}>
                    <circleGeometry args={[0.55, 32]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.8} />
                </mesh>
                {/* Shoulders */}
                <mesh position={[0, -0.65, 0]}>
                    {/* Simple arch for shoulders */}
                    <circleGeometry args={[0.9, 32, 0, Math.PI]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.8} />
                </mesh>
            </group>
        </group>
    );

    return (
        <group>
            <Stars radius={80} depth={50} count={2000} factor={3} fade speed={0.5} />

            {/* Background Grid Context */}
            <group position={[0, 0, -2]} rotation={[Math.PI / 2, 0, 0]}>
                <gridHelper args={[20, 20, 0x222222, 0x111111]} />
            </group>

            <group ref={groupRef}>
                {/* RED CHANNEL - Left */}
                <ChannelCard color="#ff0055" refProp={redRef} zOffset={0.1} />

                {/* GREEN CHANNEL - Center (Static parent, others slide to it) */}
                <ChannelCard color="#00ff88" refProp={greenRef} zOffset={0} />

                {/* BLUE CHANNEL - Right */}
                <ChannelCard color="#00ccff" refProp={blueRef} zOffset={-0.1} />
            </group>

            <pointLight position={[0, 2, 5]} color="#ffffff" intensity={2} />
            <ambientLight intensity={0.5} />
        </group>
    );
}
