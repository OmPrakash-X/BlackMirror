import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

export default function RiskScene() {
    const lowRef = useRef<THREE.Group>(null!);
    const suspRef = useRef<THREE.Group>(null!);
    const highRef = useRef<THREE.Group>(null!);
    const t = useRef(0);

    useFrame((_, delta) => {
        t.current += delta;
        if (lowRef.current) {
            lowRef.current.position.y = Math.sin(t.current * 1.2) * 0.08;
            lowRef.current.rotation.y = Math.sin(t.current * 0.6) * 0.05;
        }
        if (suspRef.current) {
            suspRef.current.position.y = 0.2 + Math.sin(t.current * 1.0 + 1) * 0.1;
            suspRef.current.rotation.y = Math.sin(t.current * 0.5 + 0.5) * 0.06;
        }
        if (highRef.current) {
            highRef.current.position.y = Math.sin(t.current * 0.8 + 2) * 0.12;
            highRef.current.rotation.y = Math.sin(t.current * 0.4 + 1) * 0.07;
        }
    });

    return (
        <group>
            <Stars radius={80} depth={50} count={2000} factor={3} fade speed={0.5} />
            <Sparkles count={40} scale={10} size={2} speed={0.4} color="#ef4444" />

            {/* ═══ LOW RISK CARD ═══ */}
            <group ref={lowRef} position={[-2.8, 0, 0]} scale={0.85}>
                <mesh>
                    <boxGeometry args={[2.4, 3.5, 0.06]} />
                    <meshPhysicalMaterial color="#0a0a1e" roughness={0.3} metalness={0.6} transparent opacity={0.75} />
                </mesh>
                <mesh>
                    <boxGeometry args={[2.5, 3.6, 0.04]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} wireframe />
                </mesh>
                <mesh position={[0, 1.65, 0.04]}>
                    <boxGeometry args={[2.2, 0.06, 0.01]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
                </mesh>
                {/* Shield Icon */}
                <group position={[0, 0.8, 0.05]}>
                    <mesh position={[0, 0.15, 0]}>
                        <boxGeometry args={[0.7, 0.5, 0.02]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} transparent opacity={0.7} />
                    </mesh>
                    <mesh position={[0, -0.25, 0]} rotation={[0, 0, Math.PI]}>
                        <coneGeometry args={[0.35, 0.5, 4]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} transparent opacity={0.7} />
                    </mesh>
                    <mesh position={[-0.08, 0.05, 0.02]} rotation={[0, 0, -0.4]}>
                        <boxGeometry args={[0.12, 0.35, 0.01]} />
                        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} />
                    </mesh>
                    <mesh position={[0.15, 0.15, 0.02]} rotation={[0, 0, 0.4]}>
                        <boxGeometry args={[0.12, 0.5, 0.01]} />
                        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} />
                    </mesh>
                </group>
                <Text position={[0, 0, 0.05]} fontSize={0.35} color="#10b981" anchorX="center" anchorY="middle">
                    LOW
                </Text>
                <mesh position={[0, -0.35, 0.04]}>
                    <boxGeometry args={[1.6, 0.02, 0.01]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} transparent opacity={0.5} />
                </mesh>
                <Text position={[0, -0.65, 0.05]} fontSize={0.25} color="#10b981" anchorX="center" anchorY="middle">
                    {"< 40%"}
                </Text>
                <mesh position={[0, -1.4, 0.04]}>
                    <boxGeometry args={[1.8, 0.15, 0.02]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} transparent opacity={0.3} />
                </mesh>
                <pointLight position={[0, -1.5, 1]} distance={3} decay={2} color="#10b981" intensity={2} />
            </group>

            {/* ═══ SUSPICIOUS CARD ═══ */}
            <group ref={suspRef} position={[0, 0.2, 0.3]} scale={0.92}>
                <mesh>
                    <boxGeometry args={[2.4, 3.5, 0.06]} />
                    <meshPhysicalMaterial color="#0a0a1e" roughness={0.3} metalness={0.6} transparent opacity={0.75} />
                </mesh>
                <mesh>
                    <boxGeometry args={[2.5, 3.6, 0.04]} />
                    <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} wireframe />
                </mesh>
                <mesh position={[0, 1.65, 0.04]}>
                    <boxGeometry args={[2.2, 0.06, 0.01]} />
                    <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3} />
                </mesh>
                {/* Warning Triangle Icon */}
                <group position={[0, 0.8, 0.05]}>
                    <mesh>
                        <coneGeometry args={[0.5, 0.85, 3]} />
                        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} transparent opacity={0.7} />
                    </mesh>
                    <mesh position={[0, 0.05, 0.02]}>
                        <boxGeometry args={[0.08, 0.35, 0.01]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                    <mesh position={[0, -0.2, 0.02]}>
                        <boxGeometry args={[0.08, 0.08, 0.01]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                </group>
                <Text position={[0, 0, 0.05]} fontSize={0.3} color="#f59e0b" anchorX="center" anchorY="middle">
                    SUSPICIOUS
                </Text>
                <mesh position={[0, -0.35, 0.04]}>
                    <boxGeometry args={[1.6, 0.02, 0.01]} />
                    <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} transparent opacity={0.5} />
                </mesh>
                <Text position={[0, -0.65, 0.05]} fontSize={0.25} color="#f59e0b" anchorX="center" anchorY="middle">
                    40% – 70%
                </Text>
                <mesh position={[0, -1.4, 0.04]}>
                    <boxGeometry args={[1.8, 0.15, 0.02]} />
                    <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} transparent opacity={0.3} />
                </mesh>
                <pointLight position={[0, -1.5, 1]} distance={3} decay={2} color="#f59e0b" intensity={2} />
            </group>

            {/* ═══ HIGH RISK CARD ═══ */}
            <group ref={highRef} position={[2.8, 0, 0.5]} scale={1.0}>
                <mesh>
                    <boxGeometry args={[2.4, 3.5, 0.06]} />
                    <meshPhysicalMaterial color="#0a0a1e" roughness={0.3} metalness={0.6} transparent opacity={0.75} />
                </mesh>
                <mesh>
                    <boxGeometry args={[2.5, 3.6, 0.04]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} wireframe />
                </mesh>
                <mesh position={[0, 1.65, 0.04]}>
                    <boxGeometry args={[2.2, 0.06, 0.01]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
                </mesh>
                {/* Danger Octagon Icon */}
                <group position={[0, 0.8, 0.05]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 0.08, 8]} />
                        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} transparent opacity={0.8} />
                    </mesh>
                    <mesh position={[0, 0, 0.05]} rotation={[0, 0, Math.PI / 4]}>
                        <boxGeometry args={[0.08, 0.55, 0.01]} />
                        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} />
                    </mesh>
                    <mesh position={[0, 0, 0.05]} rotation={[0, 0, -Math.PI / 4]}>
                        <boxGeometry args={[0.08, 0.55, 0.01]} />
                        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} />
                    </mesh>
                </group>
                <Text position={[0, 0, 0.05]} fontSize={0.32} color="#ef4444" anchorX="center" anchorY="middle">
                    HIGH RISK
                </Text>
                <mesh position={[0, -0.35, 0.04]}>
                    <boxGeometry args={[1.6, 0.02, 0.01]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} transparent opacity={0.5} />
                </mesh>
                <Text position={[0, -0.65, 0.05]} fontSize={0.25} color="#ef4444" anchorX="center" anchorY="middle">
                    {"> 70%"}
                </Text>
                <mesh position={[0, -1.4, 0.04]}>
                    <boxGeometry args={[1.8, 0.15, 0.02]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} transparent opacity={0.3} />
                </mesh>
                <pointLight position={[0, -1.5, 1]} distance={3} decay={2} color="#ef4444" intensity={2} />
            </group>

            {/* Scene Lighting */}
            <pointLight position={[-3, 2, 4]} color="#10b981" intensity={3} distance={12} />
            <pointLight position={[0, 2, 4]} color="#f59e0b" intensity={3} distance={12} />
            <pointLight position={[3, 2, 4]} color="#ef4444" intensity={5} distance={12} />
            <ambientLight intensity={0.25} />
        </group>
    );
}
