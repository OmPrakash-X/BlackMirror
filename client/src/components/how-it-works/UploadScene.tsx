import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

export default function UploadScene() {
    const t = useRef(0);
    const CYCLE = 5.0;

    const fileRef = useRef<THREE.Group>(null!);
    const serverRef = useRef<THREE.Group>(null!);
    const barFillRef = useRef<THREE.Mesh>(null!);
    const ledRef = useRef<THREE.Mesh>(null!);
    const arrowRef = useRef<THREE.Group>(null!);

    // Small dot trail — just 12 tiny spheres lagging behind the file
    const trailRefs = useRef<(THREE.Mesh | null)[]>(Array(12).fill(null));

    useFrame((_, delta) => {
        t.current += delta;
        const cycle = (t.current % CYCLE) / CYCLE; // 0 → 1

        // ── File travels left→right in a gentle arc ──
        const startX = -1.8, endX = 1.6;
        const fileX = startX + cycle * (endX - startX);
        const fileY = Math.sin(cycle * Math.PI) * 0.8; // gentle arc, peaks at center
        const opacity = cycle > 0.88 ? Math.max(0, 1 - (cycle - 0.88) / 0.12) : 1;

        if (fileRef.current) {
            fileRef.current.position.x = fileX;
            fileRef.current.position.y = fileY;
            // Gentle tilt as it flies
            fileRef.current.rotation.z = Math.sin(cycle * Math.PI) * 0.3;
            fileRef.current.children.forEach((c) => {
                const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (m && m.transparent !== undefined) m.opacity = opacity;
            });
        }

        // ── Dot trail: each dot lags behind by a fraction ──
        trailRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const lag = (i + 1) * 0.025;
            const p = Math.max(0, cycle - lag);
            mesh.position.x = startX + p * (endX - startX);
            mesh.position.y = Math.sin(p * Math.PI) * 0.8;
            const trailOpacity = Math.max(0, opacity - i * 0.07);
            (mesh.material as THREE.MeshStandardMaterial).opacity = trailOpacity;
        });

        // ── Server lights up when file arrives ──
        const arrived = cycle > 0.85 ? (cycle - 0.85) / 0.15 : 0;
        if (serverRef.current) {
            serverRef.current.children.forEach((child, i) => {
                if (i === 0) return; // skip body
                const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (m) m.emissiveIntensity = 0.4 + arrived * 3.5;
            });
        }
        if (ledRef.current) {
            (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                1.5 + Math.sin(t.current * 6) * arrived * 2;
        }

        // ── Progress bar ──
        if (barFillRef.current) {
            barFillRef.current.scale.x = Math.max(0.001, cycle);
        }

        // ── Upload arrow bounces ──
        if (arrowRef.current) {
            arrowRef.current.position.y = -0.55 + Math.abs(Math.sin(t.current * 3)) * 0.18;
        }
    });

    return (
        <group>
            <Stars radius={100} depth={60} count={2500} factor={3} fade speed={0.6} />

            {/* ══════════════════════════════════════
          LEFT — LAPTOP
          Screen tilted back ~15°, base flat
      ══════════════════════════════════════ */}
            <group position={[-2.2, 0.1, 0]}>

                {/* ── Screen panel (tilted back) ── */}
                <group rotation={[-0.22, 0, 0]} position={[0, 0.72, -0.18]}>
                    {/* Outer bezel — dark grey */}
                    <mesh>
                        <boxGeometry args={[1.9, 1.25, 0.07]} />
                        <meshStandardMaterial color="#1c1c2e" emissive="#0a0a18" emissiveIntensity={1} />
                    </mesh>
                    {/* Screen glow — cyan tinted */}
                    <mesh position={[0, 0, 0.042]}>
                        <boxGeometry args={[1.65, 1.05, 0.01]} />
                        <meshStandardMaterial color="#001a22" emissive="#00c8d4" emissiveIntensity={0.55} />
                    </mesh>
                    {/* Image on screen — purple face wireframe box */}
                    <mesh position={[0, 0.08, 0.052]}>
                        <boxGeometry args={[0.55, 0.62, 0.005]} />
                        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={1.4} wireframe />
                    </mesh>
                    {/* Filename bar at bottom of screen */}
                    <mesh position={[0, -0.42, 0.052]}>
                        <boxGeometry args={[1.3, 0.12, 0.005]} />
                        <meshStandardMaterial color="#0a2a2a" emissive="#00f5ff" emissiveIntensity={0.5} />
                    </mesh>
                    {/* Camera dot */}
                    <mesh position={[0, 0.56, 0.052]}>
                        <circleGeometry args={[0.04, 12]} />
                        <meshStandardMaterial color="#333" emissive="#555" emissiveIntensity={0.5} />
                    </mesh>
                    {/* Apple-style logo on back (visible from front as indent) */}
                </group>

                {/* ── Hinge strip ── */}
                <mesh position={[0, 0.08, -0.18]}>
                    <boxGeometry args={[1.9, 0.1, 0.12]} />
                    <meshStandardMaterial color="#111" emissive="#222" emissiveIntensity={0.3} />
                </mesh>

                {/* ── Base / keyboard deck ── */}
                <mesh position={[0, 0, 0.2]} rotation={[0.08, 0, 0]}>
                    <boxGeometry args={[1.9, 0.1, 1.3]} />
                    <meshStandardMaterial color="#1a1a2a" emissive="#0a0a18" emissiveIntensity={0.4} />
                </mesh>

                {/* ── Keyboard rows ── */}
                {[-0.28, -0.08, 0.12, 0.3].map((z, row) => (
                    <group key={row} position={[0, 0.055, 0.2 + z]} rotation={[0.08, 0, 0]}>
                        {[-0.6, -0.35, -0.1, 0.15, 0.4, 0.65].map((x, col) => (
                            <mesh key={col} position={[x, 0, 0]}>
                                <boxGeometry args={[0.18, 0.02, 0.16]} />
                                <meshStandardMaterial color="#2a2a3e" emissive="#3a3a5e" emissiveIntensity={0.4} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* ── Trackpad ── */}
                <mesh position={[0, 0.056, 0.55]} rotation={[0.08, 0, 0]}>
                    <boxGeometry args={[0.55, 0.02, 0.35]} />
                    <meshStandardMaterial color="#222233" emissive="#00f5ff" emissiveIntensity={0.15} />
                </mesh>

                {/* ── Upload arrow (bounces above laptop) ── */}
                <group ref={arrowRef} position={[0.85, -0.55, 0]}>
                    <mesh>
                        <coneGeometry args={[0.13, 0.3, 8]} />
                        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={3} />
                    </mesh>
                    <mesh position={[0, -0.22, 0]}>
                        <boxGeometry args={[0.06, 0.22, 0.06]} />
                        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={3} />
                    </mesh>
                </group>
            </group>

            {/* ══════════════════════════════════════
          DASHED PATH — straight horizontal guide
      ══════════════════════════════════════ */}
            {Array.from({ length: 7 }, (_, i) => {
                const px = -1.5 + i * 0.5;
                const py = Math.sin((i / 6) * Math.PI) * 0.8;
                return (
                    <mesh key={i} position={[px, py, 1.2]}>
                        <boxGeometry args={[0.2, 0.025, 0.01]} />
                        <meshStandardMaterial color="#00f5ff" transparent opacity={0.18} />
                    </mesh>
                );
            })}

            {/* ══════════════════════════════════════
          FLYING FILE ICON
          Flat rectangle with folded corner + lines
      ══════════════════════════════════════ */}
            <group ref={fileRef} position={[-1.8, 0, 1.5]}>
                {/* File body */}
                <mesh>
                    <boxGeometry args={[0.52, 0.65, 0.05]} />
                    <meshStandardMaterial color="#0d2a2a" emissive="#00f5ff" emissiveIntensity={2.5} transparent opacity={1} />
                </mesh>
                {/* Folded top-right corner (dark triangle effect) */}
                <mesh position={[0.17, 0.24, 0.028]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.17, 0.17, 0.015]} />
                    <meshStandardMaterial color="#050508" emissive="#003333" emissiveIntensity={0.5} transparent opacity={1} />
                </mesh>
                {/* Horizontal text lines on file */}
                {[0.05, -0.08, -0.21].map((y, i) => (
                    <mesh key={i} position={[-0.03, y, 0.03]}>
                        <boxGeometry args={[0.3 - i * 0.04, 0.035, 0.005]} />
                        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1} transparent opacity={0.6} />
                    </mesh>
                ))}
                {/* Image icon on file */}
                <mesh position={[0, 0.18, 0.03]}>
                    <boxGeometry args={[0.22, 0.18, 0.005]} />
                    <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={1.5} wireframe />
                </mesh>
            </group>

            {/* ══════════════════════════════════════
          DOT TRAIL — 12 tiny cyan spheres
      ══════════════════════════════════════ */}
            {Array.from({ length: 12 }, (_, i) => (
                <mesh
                    key={i}
                    ref={(el) => { trailRefs.current[i] = el; }}
                    position={[-1.8, 0, 1.5]}
                >
                    <sphereGeometry args={[0.055 - i * 0.003, 8, 8]} />
                    <meshStandardMaterial
                        color="#00f5ff"
                        emissive="#00f5ff"
                        emissiveIntensity={2}
                        transparent
                        opacity={0.7}
                    />
                </mesh>
            ))}

            {/* ══════════════════════════════════════
          RIGHT — AI SERVER RACK
      ══════════════════════════════════════ */}
            <group ref={serverRef} position={[2.2, 0.1, 0]}>
                {/* Main chassis */}
                <mesh position={[0, 0.2, 0]}>
                    <boxGeometry args={[1.5, 2.1, 0.55]} />
                    <meshStandardMaterial color="#0d0d1a" emissive="#111" emissiveIntensity={0.3} />
                </mesh>
                {/* Front panel face */}
                <mesh position={[0, 0.2, 0.28]} >
                    <boxGeometry args={[1.4, 2.0, 0.02]} />
                    <meshStandardMaterial color="#111122" emissive="#0a0a22" emissiveIntensity={0.5} />
                </mesh>
                {/* Server blade slots — 6 rows */}
                {[0.85, 0.55, 0.25, -0.05, -0.35, -0.65].map((y, i) => (
                    <mesh key={i} position={[0, y, 0.3]}>
                        <boxGeometry args={[1.2, 0.2, 0.03]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.4} />
                    </mesh>
                ))}
                {/* Slot indent lines */}
                {[0.85, 0.55, 0.25, -0.05, -0.35, -0.65].map((y, i) => (
                    <mesh key={`line-${i}`} position={[0.5, y, 0.32]}>
                        <boxGeometry args={[0.08, 0.12, 0.01]} />
                        <meshStandardMaterial color="#333" emissive="#444" emissiveIntensity={0.3} />
                    </mesh>
                ))}
                {/* Status LED — blinks on arrival */}
                <mesh ref={ledRef} position={[0.58, 0.85, 0.32]}>
                    <sphereGeometry args={[0.06, 10, 10]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} />
                </mesh>
                {/* Power button */}
                <mesh position={[-0.55, 0.85, 0.32]}>
                    <circleGeometry args={[0.055, 12]} />
                    <meshStandardMaterial color="#222" emissive="#444" emissiveIntensity={0.4} />
                </mesh>
                {/* Ventilation grille lines */}
                {[-0.1, 0, 0.1].map((x, i) => (
                    <mesh key={`vent-${i}`} position={[x, -0.88, 0.3]}>
                        <boxGeometry args={[0.04, 0.28, 0.02]} />
                        <meshStandardMaterial color="#1a1a2e" emissive="#222" emissiveIntensity={0.2} />
                    </mesh>
                ))}
            </group>

            {/* ══════════════════════════════════════
          PROGRESS BAR
      ══════════════════════════════════════ */}
            <group position={[0, -2.1, 0]}>
                {/* Track */}
                <mesh>
                    <boxGeometry args={[4.5, 0.1, 0.04]} />
                    <meshStandardMaterial color="#1a1a2e" />
                </mesh>
                {/* Fill */}
                <mesh ref={barFillRef} position={[-2.25, 0, 0.025]} scale={[0.001, 1, 1]}>
                    <boxGeometry args={[4.5, 0.1, 0.04]} />
                    <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2.5} />
                </mesh>
            </group>

            {/* Lights */}
            <pointLight position={[0, 1, 5]} color="#00f5ff" intensity={4} distance={14} />
            <pointLight position={[-2.2, 1, 4]} color="#7c3aed" intensity={3} distance={9} />
            <pointLight position={[2.2, 1, 4]} color="#10b981" intensity={4} distance={9} />
            <ambientLight intensity={0.2} />
        </group>
    );
}
