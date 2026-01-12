import { useState, useRef, useCallback, memo, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import Shoe3D from "./Shoe3D";

// Preload shoe model for faster loading
if (typeof window !== 'undefined') {
  useGLTF.preload("/shoe.glb");
}

interface ShoeInstance {
  id: number;
  startPosition: [number, number, number];
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
}

interface ShoeCanvasProps {
  onShoeCreate: (createShoe: () => void) => void;
}

const ShoeCanvas = memo(({ onShoeCreate }: ShoeCanvasProps) => {
  const [shoes, setShoes] = useState<ShoeInstance[]>([]);
  const shoeIdCounter = useRef(0);

  const createShoe = useCallback(() => {
    // Случайная позиция вылета снизу футера
    const randomX = (Math.random() - 0.5) * 16; // От -8 до 8 (как при удалении)
    const startZ = 4; // Фиксированная глубина
    const startY = -2; // Начальная позиция (поднята выше)
    
    // Случайная скорость вылета (как будто кинули) - уменьшена для более медленного реалистичного полета
    const throwPower = (0.6 + Math.random() * 0.4) / 3; // От 0.2 до 0.33 (медленнее и реалистичнее)
    const angleX = (Math.random() - 0.5) * 0.8; // Угол по X
    const angleY = 0.5 + Math.random() * 0.3; // Угол вверх (увеличен для более высокого полета)
    // Z скорость всегда 0, так как глубина фиксирована
    const angleZ = 0;
    
    const velocity: [number, number, number] = [
      angleX * throwPower,
      angleY * throwPower,
      angleZ // Всегда 0
    ];
    
    // Случайная угловая скорость (вращение)
    const angularVelocity: [number, number, number] = [
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3
    ];
    
    const newShoe: ShoeInstance = {
      id: shoeIdCounter.current++,
      startPosition: [randomX, startY, startZ],
      velocity,
      angularVelocity
    };
    
    console.log("Creating shoe:", { startPosition: [randomX, startY, startZ], velocity, angularVelocity });
    setShoes(prev => {
      console.log("Total shoes after adding:", prev.length + 1);
      return [...prev, newShoe];
    });
  }, []);

  const removeShoe = useCallback((id: number) => {
    setShoes(prev => prev.filter(shoe => shoe.id !== id));
  }, []);

  useEffect(() => {
    onShoeCreate(createShoe);
  }, [onShoeCreate]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '600px',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl, scene, camera }) => {
          console.log("ShoeCanvas created, shoes count:", shoes.length);
          console.log("Camera position:", camera.position);
          camera.lookAt(0, 0, 0);
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, 5, 5]} intensity={1.2} />
        <directionalLight position={[0, 5, 0]} intensity={1} />
        <pointLight position={[0, 0, 0]} intensity={0.8} distance={10} />
        <Suspense fallback={null}>
          {shoes.length > 0 && (
            <>
              {shoes.map((shoe) => (
                <Shoe3D
                  key={shoe.id}
                  startPosition={shoe.startPosition}
                  velocity={shoe.velocity}
                  angularVelocity={shoe.angularVelocity}
                  onRemove={() => removeShoe(shoe.id)}
                />
              ))}
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
});

ShoeCanvas.displayName = 'ShoeCanvas';

export default ShoeCanvas;
