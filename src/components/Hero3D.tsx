import { useRef, Suspense, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

interface Model3DProps {
  modelPath: string;
  scrollProgress: number;
  mousePosition?: { x: number; y: number };
}

const Model = ({ modelPath, scrollProgress, mousePosition = { x: 0, y: 0 } }: Model3DProps) => {
  // Load model with caching enabled
  const { scene } = useGLTF(modelPath, true);
  const meshRef = useRef<THREE.Group>(null);
  
  // Optimize: dispose of unused geometries and materials
  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [scene]);

  // Clone and center the scene - memoized
  const { clonedScene, box, scale } = useMemo(() => {
    const cloned = scene.clone();
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 2 / maxDim : 1;
    return { clonedScene: cloned, box, scale };
  }, [scene]);

  // Rotate model based on scroll progress - memoized calculation
  const rotationY = useMemo(() => scrollProgress * Math.PI * 0.5, [scrollProgress]);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotationY;
    }
  });

  return (
    <Center>
      <primitive 
        ref={meshRef}
        object={clonedScene} 
        scale={scale}
      />
    </Center>
  );
};

interface Hero3DProps {
  modelPath: string;
  scrollProgress: number;
  mousePosition?: { x: number; y: number };
}

const CameraController = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    const intensity = 0.5; // Adjust this to control the movement intensity
    camera.position.x = mousePosition.x * intensity;
    camera.position.y = -mousePosition.y * intensity; // Invert Y for natural feel
    camera.position.z = 5; // Keep Z position constant
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};

const Hero3D = ({ modelPath, scrollProgress, mousePosition = { x: 0, y: 0 } }: Hero3DProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ 
        width: "100%", 
        height: "100%", 
        background: "white",
        display: "block"
      }}
      gl={{ 
        alpha: true, 
        antialias: true, 
        preserveDrawingBuffer: false, // Disable for better performance
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      dpr={[1, 2]} // Limit pixel ratio for better performance
      performance={{ min: 0.5 }} // Lower framerate threshold
      onError={(error) => {
        console.error("3D Canvas error:", error);
      }}
    >
      <Suspense fallback={null}>
        <CameraController mousePosition={mousePosition} />
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
        
        <Model modelPath={modelPath} scrollProgress={scrollProgress} mousePosition={mousePosition} />
      </Suspense>
    </Canvas>
  );
};

export default Hero3D;

