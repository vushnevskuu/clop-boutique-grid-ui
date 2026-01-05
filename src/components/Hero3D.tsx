import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

interface Model3DProps {
  modelPath: string;
  scrollProgress: number;
}

function Model({ modelPath, scrollProgress }: Model3DProps) {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid conflicts
  const clonedScene = scene.clone();

  // Rotate model based on scroll progress - subtle rotation
  useFrame(() => {
    if (meshRef.current) {
      // Subtle rotation on Y axis (90 degrees over full scroll)
      meshRef.current.rotation.y = scrollProgress * Math.PI * 0.5;
    }
  });

  return (
    <primitive 
      ref={meshRef}
      object={clonedScene} 
      scale={1} 
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
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />
        
        <Model modelPath={modelPath} scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
};

export default Hero3D;

