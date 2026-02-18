import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Text } from "@react-three/drei";
import * as THREE from "three";

export default function VideoScene() {
    const stripRef = useRef<THREE.Group>(null!);
    const t = useRef(0);

    const FRAME_COUNT = 10;
    const FRAME_SPACING = 2.4;
    const STRIP_LENGTH = FRAME_COUNT * FRAME_SPACING; // 24
    const SPEED = 0.6;

    useFrame((_, delta) => {
        t.current += delta;
        if (stripRef.current) {
            // Simple: move the whole strip left, loop when it's gone far enough
            stripRef.current.position.x = -((t.current * SPEED) % STRIP_LENGTH);
        }
    });

    const fakeFrames = [1, 3, 6, 8];

    return (
        <group>
            <Stars radius={80} depth={50} count={2000} factor={3} fade speed={0.5} />

            {/* Moving filmstrip */}
            <group ref={stripRef}>
                {Array.from({ length: FRAME_COUNT }, (_, i) => {
                    const isFake = fakeFrames.includes(i);
                    const color = isFake ? "#ef4444" : "#10b981";
                    return (
                        <group key={i} position={[i * FRAME_SPACING, 0, 0]}>
                            {/* Frame border */}
                            <mesh>
                                <boxGeometry args={[2, 2.6, 0.05]} />
                                <meshStandardMaterial
                                    color="#1a1a2e"
                                    emissive={color}
                                    emissiveIntensity={0.15}
                                />
                            </mesh>
                            {/* Inner dark area */}
                            <mesh position={[0, 0.1, 0.03]}>
                                <boxGeometry args={[1.6, 1.8, 0.01]} />
                                <meshStandardMaterial color="#000" />
                            </mesh>
                            {/* Face silhouette - head */}
                            <mesh position={[0, 0.4, 0.05]}>
                                <circleGeometry args={[0.3, 32]} />
                                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.8} />
                            </mesh>
                            {/* Face silhouette - shoulders */}
                            <mesh position={[0, -0.2, 0.05]}>
                                <circleGeometry args={[0.5, 32, 0, Math.PI]} />
                                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.8} />
                            </mesh>
                            {/* Label */}
                            <Text position={[0, -1.15, 0.06]} fontSize={0.18} color={color} anchorX="center">
                                {isFake ? "FAKE" : "REAL"}
                            </Text>
                            {/* Sprocket holes top & bottom */}
                            {[-1.4, 1.4].map((sy) => (
                                <group key={sy}>
                                    {[-0.7, -0.35, 0, 0.35, 0.7].map((sx, si) => (
                                        <mesh key={si} position={[sx, sy, 0.03]}>
                                            <boxGeometry args={[0.12, 0.12, 0.01]} />
                                            <meshBasicMaterial color="#000" />
                                        </mesh>
                                    ))}
                                </group>
                            ))}
                        </group>
                    );
                })}
            </group>

            {/* Scanner line (static, in the middle of view) */}
            <group position={[0, 0, 0.5]}>
                <mesh>
                    <boxGeometry args={[0.08, 4, 0.08]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={4} />
                </mesh>
                <pointLight distance={4} decay={2} color="#10b981" intensity={5} />
                <mesh position={[0, 0, -0.15]}>
                    <planeGeometry args={[1.2, 3.5]} />
                    <meshBasicMaterial color="#10b981" transparent opacity={0.06} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
                </mesh>
            </group>

            <pointLight position={[0, 0, 4]} color="#10b981" intensity={4} distance={12} />
            <ambientLight intensity={0.4} />
        </group>
    );
}
