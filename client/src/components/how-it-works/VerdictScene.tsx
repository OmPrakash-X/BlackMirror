import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

export default function VerdictScene() {
    const cardRef = useRef<THREE.Group>(null!);
    const ringRef = useRef<THREE.Mesh>(null!);
    const glowRef = useRef<THREE.PointLight>(null!);
    const t = useRef(0);
    const [score, setScore] = useState(0);

    useFrame((_, delta) => {
        t.current += delta;

        // Card gentle float
        if (cardRef.current) {
            cardRef.current.rotation.y = Math.sin(t.current * 0.4) * 0.08;
            cardRef.current.position.y = 0.2 + Math.sin(t.current * 0.7) * 0.08;
        }

        // Confidence score animation (0 → 94 over 2.5s)
        const progress = Math.min(1, t.current / 2.5);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.floor(eased * 94);
        if (currentScore !== score) setScore(currentScore);

        // Confidence ring arc animation
        if (ringRef.current) {
            // Dispose old geometry and replace with updated arc
            const targetAngle = eased * Math.PI * 2 * 0.94; // 94% of the circle
            // Dispose old geometry and create new one with updated arc
            ringRef.current.geometry.dispose();
            ringRef.current.geometry = new THREE.RingGeometry(1.55, 1.7, 64, 1, -Math.PI / 2, targetAngle);
        }

        // Pulsing glow
        if (glowRef.current) {
            glowRef.current.intensity = 4 + Math.sin(t.current * 3) * 1.5;
        }
    });

    return (
        <group>
            <Stars radius={80} depth={50} count={3000} factor={4} fade speed={1} />
            <Sparkles count={60} scale={10} size={2} speed={0.5} color="#10b981" />

            <group ref={cardRef} position={[0, 0.2, 0]}>
                {/* ═══ MAIN CARD BACKPLATE ═══ */}
                <mesh>
                    <boxGeometry args={[5.5, 4, 0.06]} />
                    <meshPhysicalMaterial
                        color="#050510"
                        roughness={0.2}
                        metalness={0.8}
                        transparent
                        opacity={0.85}
                    />
                </mesh>

                {/* Outer border glow */}
                <mesh>
                    <boxGeometry args={[5.6, 4.1, 0.04]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} wireframe />
                </mesh>

                {/* Top accent bar */}
                <mesh position={[0, 1.9, 0.04]}>
                    <boxGeometry args={[5.2, 0.06, 0.01]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={4} />
                </mesh>

                {/* Bottom accent bar */}
                <mesh position={[0, -1.9, 0.04]}>
                    <boxGeometry args={[5.2, 0.04, 0.01]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
                </mesh>

                {/* ═══ LEFT SECTION — Confidence Ring ═══ */}
                <group position={[-1.5, 0.2, 0.05]}>
                    {/* Background ring track */}
                    <mesh rotation={[0, 0, 0]}>
                        <ringGeometry args={[1.55, 1.7, 64]} />
                        <meshStandardMaterial color="#1a1a2e" emissive="#1a1a2e" emissiveIntensity={0.5} transparent opacity={0.6} />
                    </mesh>

                    {/* Animated confidence arc */}
                    <mesh ref={ringRef} rotation={[0, 0, 0]}>
                        <ringGeometry args={[1.55, 1.7, 64, 1, -Math.PI / 2, 0]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
                    </mesh>

                    {/* Score text in center */}
                    <Text position={[0, 0.15, 0.02]} fontSize={0.6} color="#10b981" anchorX="center" anchorY="middle">
                        {score}%
                    </Text>
                    <Text position={[0, -0.3, 0.02]} fontSize={0.16} color="#6ee7b7" anchorX="center" anchorY="middle">
                        CONFIDENCE
                    </Text>

                    {/* Inner decorative ring */}
                    <mesh>
                        <ringGeometry args={[1.3, 1.35, 64]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} transparent opacity={0.2} />
                    </mesh>
                </group>

                {/* ═══ RIGHT SECTION — Verdict Info ═══ */}
                <group position={[1.5, 0, 0.05]}>
                    {/* VERDICT label */}
                    <Text position={[0, 1.4, 0]} fontSize={0.14} color="#4b5563" anchorX="center" anchorY="middle">
                        VERDICT
                    </Text>

                    {/* REAL badge */}
                    <group position={[0, 0.95, 0]}>
                        <mesh>
                            <boxGeometry args={[2.4, 0.55, 0.02]} />
                            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.4} transparent opacity={0.15} />
                        </mesh>
                        <mesh>
                            <boxGeometry args={[2.45, 0.6, 0.01]} />
                            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} wireframe />
                        </mesh>
                        <Text position={[0, 0, 0.02]} fontSize={0.3} color="#10b981" anchorX="center" anchorY="middle">
                            ✓ VERIFIED
                        </Text>
                    </group>

                    {/* Divider */}
                    <mesh position={[0, 0.55, 0]}>
                        <boxGeometry args={[2.2, 0.015, 0.01]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} transparent opacity={0.3} />
                    </mesh>

                    {/* Risk Level */}
                    <Text position={[-0.7, 0.25, 0]} fontSize={0.14} color="#6b7280" anchorX="left" anchorY="middle">
                        Risk Level
                    </Text>
                    <group position={[0.6, 0.25, 0]}>
                        <mesh>
                            <boxGeometry args={[0.8, 0.28, 0.01]} />
                            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} transparent opacity={0.2} />
                        </mesh>
                        <Text position={[0, 0, 0.01]} fontSize={0.15} color="#10b981" anchorX="center" anchorY="middle">
                            LOW
                        </Text>
                    </group>

                    {/* Model */}
                    <Text position={[-0.7, -0.05, 0]} fontSize={0.14} color="#6b7280" anchorX="left" anchorY="middle">
                        AI Model
                    </Text>
                    <Text position={[0.6, -0.05, 0]} fontSize={0.13} color="#00f5ff" anchorX="center" anchorY="middle">
                        EfficientNet-B0
                    </Text>

                    {/* Processing Time */}
                    <Text position={[-0.7, -0.35, 0]} fontSize={0.14} color="#6b7280" anchorX="left" anchorY="middle">
                        Process Time
                    </Text>
                    <Text position={[0.6, -0.35, 0]} fontSize={0.13} color="#00f5ff" anchorX="center" anchorY="middle">
                        1.2 seconds
                    </Text>

                    {/* Divider */}
                    <mesh position={[0, -0.6, 0]}>
                        <boxGeometry args={[2.2, 0.015, 0.01]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} transparent opacity={0.3} />
                    </mesh>

                    {/* Status indicators row */}
                    <group position={[0, -0.85, 0]}>
                        {/* Dot indicators */}
                        {[
                            { x: -0.8, label: "FACE", active: true },
                            { x: -0.2, label: "META", active: true },
                            { x: 0.4, label: "FREQ", active: true },
                            { x: 1.0, label: "NOISE", active: true },
                        ].map((item, i) => (
                            <group key={i} position={[item.x, 0, 0]}>
                                <mesh>
                                    <circleGeometry args={[0.06, 16]} />
                                    <meshStandardMaterial
                                        color={item.active ? "#10b981" : "#374151"}
                                        emissive={item.active ? "#10b981" : "#000"}
                                        emissiveIntensity={item.active ? 3 : 0}
                                    />
                                </mesh>
                                <Text position={[0, -0.15, 0]} fontSize={0.08} color="#6b7280" anchorX="center">
                                    {item.label}
                                </Text>
                            </group>
                        ))}
                    </group>
                </group>

                {/* ═══ VERTICAL DIVIDER ═══ */}
                <mesh position={[-0.1, 0, 0.04]}>
                    <boxGeometry args={[0.02, 3.4, 0.01]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} transparent opacity={0.3} />
                </mesh>

                {/* ═══ SCAN LINES OVERLAY ═══ */}
                {Array.from({ length: 12 }, (_, i) => (
                    <mesh key={i} position={[0, -1.7 + i * 0.3, 0.035]}>
                        <boxGeometry args={[5.3, 0.005, 0.001]} />
                        <meshBasicMaterial color="#10b981" transparent opacity={0.04} />
                    </mesh>
                ))}

                {/* Corner accents */}
                {[
                    [-2.7, 1.9],
                    [2.7, 1.9],
                    [-2.7, -1.9],
                    [2.7, -1.9],
                ].map(([x, y], i) => (
                    <group key={i} position={[x, y, 0.04]}>
                        <mesh>
                            <boxGeometry args={[0.3, 0.04, 0.01]} />
                            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={4} />
                        </mesh>
                        <mesh>
                            <boxGeometry args={[0.04, 0.3, 0.01]} />
                            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={4} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Lighting */}
            <pointLight ref={glowRef} position={[0, 0, 4]} color="#10b981" intensity={4} distance={12} />
            <pointLight position={[3, 2, 3]} color="#00f5ff" intensity={2} distance={10} />
            <pointLight position={[-3, -1, 3]} color="#10b981" intensity={2} distance={10} />
            <ambientLight intensity={0.3} />
        </group>
    );
}
