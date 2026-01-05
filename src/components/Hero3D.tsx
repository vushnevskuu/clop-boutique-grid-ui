import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface Model3DProps {
  modelPath: string;
  scrollProgress: number;
}

function Model({ modelPath, scrollProgress }: Model3DProps) {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef<THREE.Group>(null);

  // Clone and center the scene
  const { clonedScene, box } = useMemo(() => {
    const cloned = scene.clone();
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center); // Center the model
    return { clonedScene: cloned, box };
  }, [scene]);

  // Rotate model based on scroll progress - subtle rotation
  useFrame(() => {
    if (meshRef.current) {
      // Subtle rotation on Y axis (90 degrees over full scroll)
      meshRef.current.rotation.y = scrollProgress * Math.PI * 0.5;
    }
  });

  // Calculate scale to fit model nicely in view
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 2 / maxDim : 1;

  return (
    <primitive 
      ref={meshRef}
      object={clonedScene} 
      scale={scale}
      position={[0, 0, 0]}
    />
  );
}

interface Hero3DProps {
  modelPath: string;
  scrollProgress: number;
}

const Hero3D = ({ modelPath, scrollProgress }: Hero3DProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      onError={(error) => {
        console.error("3D Canvas error:", error);
      }}
    >
      <Suspense fallback={null}>
        {/* Base ambient light for overall illumination */}
        <ambientLight intensity={1.2} />
        
        {/* Hemisphere light for natural sky/ground lighting */}
        <hemisphereLight 
          skyColor={0xffffff} 
          groundColor={0xffffff} 
          intensity={0.8} 
        />
        
        {/* Main directional lights from multiple angles */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          castShadow={false}
        />
        <directionalLight 
          position={[-5, 5, 5]} 
          intensity={1.2} 
          castShadow={false}
        />
        <directionalLight 
          position={[0, -5, 5]} 
          intensity={0.8} 
          castShadow={false}
        />
        <directionalLight 
          position={[0, 5, -5]} 
          intensity={1.0} 
          castShadow={false}
        />
        
        {/* Point light for additional fill */}
        <pointLight 
          position={[0, 0, 5]} 
          intensity={0.6} 
        />
        
        <Model modelPath={modelPath} scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
};

export default Hero3D;

