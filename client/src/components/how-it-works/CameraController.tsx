import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraController() {
    const { camera } = useThree();
    useFrame(() => {
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.05);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.05);
    });
    return null;
}
