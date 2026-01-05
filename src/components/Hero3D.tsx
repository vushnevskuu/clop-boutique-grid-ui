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

  // Rotate model based on scroll progress
  useFrame(() => {
    if (meshRef.current) {
      // Rotate Y axis based on scroll (360 degrees over full scroll)
      meshRef.current.rotation.y = scrollProgress * Math.PI * 2;
      // Optional: slight rotation on X axis for more dynamic effect
      meshRef.current.rotation.x = scrollProgress * Math.PI * 0.2;
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
      style={{ width: "100%", height: "100%" }}
      gl={{ alpha: true, antialias: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Model modelPath={modelPath} scrollProgress={scrollProgress} />
        
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
};

export default Hero3D;

