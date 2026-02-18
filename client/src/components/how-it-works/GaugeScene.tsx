import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

// Helper: 3D 7-Segment Digit (Neon Style)
const SevenSegmentDigit = ({ value, color }: { value: number, color: string }) => {
    const thickness = 0.12; // Thinner for neon look
    const length = 0.9;
    const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} toneMapped={false} />;

    const map: Record<number, boolean[]> = {
        0: [true, true, true, true, true, true, false],
        1: [false, true, true, false, false, false, false],
        2: [true, true, false, true, true, false, true],
        3: [true, true, true, true, false, false, true],
        4: [false, true, true, false, false, true, true],
        5: [true, false, true, true, false, true, true],
        6: [true, false, true, true, true, true, true],
        7: [true, true, true, false, false, false, false],
        8: [true, true, true, true, true, true, true],
        9: [true, true, true, true, false, true, true],
    };
    const active = map[value] || map[8];

    const Segment = ({ pos, rot }: { pos: [number, number, number], rot?: [number, number, number] }) => (
        <mesh position={pos} rotation={rot ? new THREE.Euler(...rot) : undefined}>
            <capsuleGeometry args={[thickness, length, 4, 8]} />
            {mat}
        </mesh>
    );

    return (
        <group>
            {active[0] && <Segment pos={[0, length, 0]} rot={[0, 0, Math.PI / 2]} />}  {/* A */}
            {active[1] && <Segment pos={[length / 2, length / 2, 0]} />}               {/* B */}
            {active[2] && <Segment pos={[length / 2, -length / 2, 0]} />}              {/* C */}
            {active[3] && <Segment pos={[0, -length, 0]} rot={[0, 0, Math.PI / 2]} />} {/* D */}
            {active[4] && <Segment pos={[-length / 2, -length / 2, 0]} />}             {/* E */}
            {active[5] && <Segment pos={[-length / 2, length / 2, 0]} />}              {/* F */}
            {active[6] && <Segment pos={[0, 0, 0]} rot={[0, 0, Math.PI / 2]} />}       {/* G */}
        </group>
    );
};

export default function GaugeScene() {
    const ringRef = useRef<THREE.Mesh>(null!);
    const [score, setScore] = useState(0);

    const startTime = useRef<number | null>(null);

    // Animation loop: 0 to 87 over 3.5 seconds
    useFrame((state) => {
        if (startTime.current === null) {
            startTime.current = state.clock.elapsedTime;
        }
        const elapsed = state.clock.elapsedTime - startTime.current;

        const duration = 3.5;
        const progress = Math.min(1, elapsed / duration);
        // Easing: EaseOutQuart
        const eased = 1 - Math.pow(1 - progress, 4);

        // Update Score state for display
        setScore(Math.floor(eased * 87));

        // Update Ring Arc
        if (ringRef.current) {
            // Visual arc length requires rebuilding geometry or using a shader.
            // Easiest "loading ring" in basic ThreeJS: Rotate a clip plane? 
            // Or simpler: Just scale a ring? No.
            // Let's use `dash` texture offset? 
            // ACTUALLY: Let's simple Rotate a partial torus to appear like it's filling? 
            // No, standard way: multiple segments.

            // CHEAP TRICK: Rotate the ring so it "fills" from the top? 
            // Or just Scale it on one axis? No.
            // Let's stick to a static 'target' ring and a 'filling' ring appearing.
            // For this demo, let's just rotate the ring to show activity.
            ringRef.current.rotation.z = -Math.PI / 2 - (eased * Math.PI * 2 * 0.87);
        }
    });

    return (
        <group>
            <Stars radius={80} depth={50} count={3000} factor={3} fade speed={1} />

            {/* ── BACKPLATE ── */}
            <mesh position={[0, 0, -0.2]}>
                <boxGeometry args={[4.5, 2.5, 0.1]} />
                <meshPhysicalMaterial
                    color="#000"
                    roughness={0.2}
                    metalness={0.8}
                    transparent
                    opacity={0.6}
                    transmission={0.5}
                    thickness={0.5}
                />
            </mesh>

            {/* ── 7-SEGMENT DISPLAY ── */}
            <group position={[-1.1, 0, 0]}>
                <SevenSegmentDigit value={Math.floor(score / 10)} color="#ef4444" />
            </group>
            <group position={[0.6, 0, 0]}>
                <SevenSegmentDigit value={score % 10} color="#ef4444" />
            </group>

            {/* ── "%" SYMBOL ── */}
            <group position={[1.8, 0.5, 0]} scale={0.4}>
                <mesh position={[-1, 1, 0]}>
                    <sphereGeometry args={[0.3]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
                </mesh>
                <mesh position={[1, -1, 0]}>
                    <sphereGeometry args={[0.3]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
                </mesh>
                <mesh rotation={[0, 0, -Math.PI / 4]}>
                    <capsuleGeometry args={[0.15, 3, 4, 8]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
                </mesh>
            </group>

            {/* ── CIRCULAR PROGRESS RING ── */}
            {/* Background Track */}
            <mesh position={[0, -0.2, -0.1]}>
                <torusGeometry args={[3.2, 0.1, 16, 64, Math.PI * 2]} />
                <meshStandardMaterial color="#1a1a2e" />
            </mesh>

            {/* Dynamic Segmented Ring (Simulating fill) */}
            {Array.from({ length: 60 }).map((_, i) => {
                // Only render segments up to current score
                const threshold = (i / 60) * 100;
                if (score < threshold) return null;

                const angle = Math.PI / 2 - (i / 60) * Math.PI * 2 * 0.87; // Start top, go clockwise
                const x = Math.cos(angle) * 3.2;
                const y = Math.sin(angle) * 3.2 - 0.2;

                return (
                    <mesh key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
                        <boxGeometry args={[0.1, 0.3, 0.05]} />
                        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
                    </mesh>
                );
            })}

            <pointLight position={[0, 2, 5]} color="#ef4444" intensity={4} distance={15} />
            <ambientLight intensity={0.2} />
        </group>
    );
}
