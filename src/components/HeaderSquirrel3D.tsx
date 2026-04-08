import { Suspense, useMemo, useRef, useEffect } from "react";
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

  useEffect(() => {
    const obj = clonedScene.object;
    return () => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [clonedScene.object]);

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
      position={[0, -0.06, 0]}
    />
  );
}

/** Компактная белка для шапки: маленький canvas, минимум света, без тяжёлой камеры. */
export default function HeaderSquirrel3D() {
  return (
    <div
      className="h-9 w-9 md:h-10 md:w-10 shrink-0 overflow-hidden rounded-full bg-white/95 ring-1 ring-black/5"
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 2.15], fov: 40 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
          stencil: false,
          depth: true,
        }}
        dpr={1}
        performance={{ min: 0.4 }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[2.5, 4, 3]} intensity={0.45} />
        <Suspense fallback={null}>
          <SquirrelModel modelPath="/model.glb" />
        </Suspense>
      </Canvas>
    </div>
  );
}
