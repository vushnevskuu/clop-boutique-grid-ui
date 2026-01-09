import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

const AnimatedSphere = () => {
  const meshRef = useRef<Mesh>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay visibility for entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useFrame((state) => {
    if (meshRef.current && isVisible) {
      // Rotate sphere
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} scale={isVisible ? 1 : 0}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#000000" 
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
};

interface Sphere3DProps {
  isVisible: boolean;
}

const Sphere3D = ({ isVisible }: Sphere3DProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Animate appearance with delay
      setTimeout(() => {
        setOpacity(1);
        setScale(1);
      }, 300);
      
      // Auto-hide after 3 seconds
      const hideTimer = setTimeout(() => {
        setOpacity(0);
        setScale(0.3);
        setTimeout(() => setShouldRender(false), 800);
      }, 3000);
      
      return () => clearTimeout(hideTimer);
    } else {
      setOpacity(0);
      setScale(0.3);
      setTimeout(() => setShouldRender(false), 800);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: "200px",
        height: "200px",
        opacity: opacity,
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 99998,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 5]} intensity={0.8} />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
};

export default Sphere3D;
