import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

export default function NeuralScene() {
    const groupRef = useRef<THREE.Group>(null!);
    const scannerRef = useRef<THREE.Group>(null!);
    const t = useRef(0);

    // Generate a grid of "pixels" to represent the image data
    // Some pixels are marked as "fake" (hidden pattern)
    const pixels = useMemo(() => {
        const temp = [];
        const size = 10; // 10x10 grid
        const spacing = 0.45;
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                // Create a focused "glitch cluster" in the center-ish
                const cx = x - size / 2 + 0.5;
                const cy = y - size / 2 + 0.5;
                const dist = Math.sqrt(cx * cx + cy * cy);
                // "Hidden pattern" is primarily in the center
                const isFake = dist < 2.0 && Math.random() > 0.4;

                temp.push({
                    x: cx * spacing,
                    y: cy * spacing,
                    isFake,
                    id: `${x}-${y}`,
                });
            }
        }
        return temp;
    }, []);

    useFrame((_, delta) => {
        t.current += delta;

        // Scanner moves up and down
        const scanPos = Math.sin(t.current * 1.5) * 2.5;

        if (scannerRef.current) {
            scannerRef.current.position.y = scanPos;
        }

        if (groupRef.current) {
            groupRef.current.children.forEach((child: any) => {
                // Ensure we are manipulating the pixel meshes
                if (child.userData.isPixel) {
                    const dist = Math.abs(child.position.y - scanPos);
                    const { isFake } = child.userData;
                    const material = child.material as THREE.MeshStandardMaterial;

                    // Activation logic: scan beam width approx 0.8 units
                    let intensity = 0;
                    if (dist < 0.8) {
                        intensity = 1 - (dist / 0.8); // 1.0 at center, 0.0 at edge
                        intensity = Math.pow(intensity, 2); // Sharpen the curve
                    }

                    if (intensity > 0.01) {
                        if (isFake) {
                            // Found a pattern! Glow RED and pop out
                            material.color.setHex(0xff0055); // Red
                            material.emissive.setHex(0xff0055);
                            material.emissiveIntensity = 3 * intensity;
                            child.position.z = intensity * 0.5; // Pop forward
                            child.scale.setScalar(1 + intensity * 0.4);
                        } else {
                            // Normal pixel: Glow CYAN/Blue
                            material.color.setHex(0x00f5ff);
                            material.emissive.setHex(0x00f5ff);
                            material.emissiveIntensity = 0.5 * intensity;
                            child.position.z = intensity * 0.1; // Slight ripple
                            child.scale.setScalar(1);
                        }
                    } else {
                        // Dormant state (Dark grey blocks)
                        material.color.setHex(0x1a1a2e);
                        material.emissive.setHex(0x000000);
                        material.emissiveIntensity = 0;
                        child.position.z = THREE.MathUtils.lerp(child.position.z, 0, 0.1);
                        child.scale.setScalar(1);
                    }
                }
            });
        }
    });

    return (
        <group>
            <Stars radius={80} depth={50} count={2500} factor={3} fade speed={0.8} />

            {/* Background context: Wireframe layout */}
            <group position={[0, 0, -1]}>
                <mesh>
                    <planeGeometry args={[5, 5]} />
                    <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.05} />
                </mesh>
            </group>

            {/* The Pixel Grid */}
            <group ref={groupRef}>
                {pixels.map((p) => (
                    <mesh
                        key={p.id}
                        position={[p.x, p.y, 0]}
                        userData={{ isPixel: true, isFake: p.isFake }}
                    >
                        <boxGeometry args={[0.35, 0.35, 0.1]} />
                        <meshStandardMaterial color="#1a1a2e" roughness={0.4} />
                    </mesh>
                ))}
            </group>

            {/* The Scanner Bar */}
            <group ref={scannerRef}>
                {/* Glowing Beam */}
                <mesh position={[0, 0, 0.5]}>
                    <boxGeometry args={[6, 0.15, 0.1]} />
                    <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={4} />
                </mesh>

                {/* Scanning Light Cone */}
                <pointLight distance={4} decay={1.5} intensity={3} color="#00f5ff" />

                {/* Faint sheet light to cover width */}
                <mesh position={[0, 0, 0.2]} rotation={[0, 0, 0]}>
                    <planeGeometry args={[6, 1.5]} />
                    <meshBasicMaterial color="#00f5ff" transparent opacity={0.08} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
                </mesh>
            </group>

            <ambientLight intensity={0.2} />
        </group>
    );
}
