import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

if (typeof window !== "undefined") {
  useGLTF.preload("/model.glb");
}

function SquirrelModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath, true);
  const meshRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const baseScale = maxDim > 0 ? 1.65 / maxDim : 1;
    return { object: cloned, scale: baseScale * 0.92 };
  }, [scene]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.42;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={clonedScene.object}
      scale={clonedScene.scale}
      position={[0, -0.04, 0]}
    />
  );
}

/** Компактная белка в шапке: ровное освещение с нескольких сторон + экспозиция. */
export default function HeaderSquirrel3D() {
  return (
    <div
      className="h-9 w-9 md:h-10 md:w-10 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/5"
      aria-hidden
    >
      <Canvas
        camera={{ position: [0.12, 0.2, 2.45], fov: 38 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "default",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.4 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.35;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={1.05} />
        <hemisphereLight args={["#ffffff", "#e8e8e8", 0.85]} />
        <directionalLight position={[2.8, 4.5, 5]} intensity={0.95} />
        <directionalLight position={[-4, 2, 3]} intensity={0.55} />
        <directionalLight position={[0, -2, 4]} intensity={0.4} />
        <directionalLight position={[0, 1.5, -3]} intensity={0.35} />
        <pointLight position={[0.5, 0.4, 2.2]} intensity={0.45} distance={8} decay={2} />
        <Suspense fallback={null}>
          <SquirrelModel modelPath="/model.glb" />
        </Suspense>
      </Canvas>
    </div>
  );
}
