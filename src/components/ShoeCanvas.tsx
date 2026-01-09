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
    const randomX = (Math.random() - 0.5) * 4; // От -2 до 2
    const randomZ = Math.random() * 2 - 1; // От -1 до 1
    const startY = -2; // Начальная позиция снизу (за футером, вылетает вверх)
    
    // Случайная скорость вылета (как будто кинули) - уменьшена в 2 раза
    // ВАЖНО: angleY должен быть положительным для вылета ВВЕРХ
    const throwPower = (0.5 + Math.random() * 0.5) / 2; // От 0.25 до 0.5 (уменьшено в 2 раза)
    const angleX = (Math.random() - 0.5) * 0.8; // Угол по X
    const angleY = 0.5 + Math.random() * 0.4; // Угол вверх (увеличен, всегда положительный)
    const angleZ = (Math.random() - 0.5) * 0.3; // Небольшой угол по Z
    
    const velocity: [number, number, number] = [
      angleX * throwPower,
      angleY * throwPower, // Положительная скорость Y = вылет вверх
      angleZ * throwPower
    ];
    
    // Случайная угловая скорость (вращение) - уменьшена в 2 раза
    const angularVelocity: [number, number, number] = [
      (Math.random() - 0.5) * 0.15,
      (Math.random() - 0.5) * 0.15,
      (Math.random() - 0.5) * 0.15
    ];
    
    const newShoe: ShoeInstance = {
      id: shoeIdCounter.current++,
      startPosition: [randomX, startY, randomZ],
      velocity,
      angularVelocity
    };
    
    setShoes(prev => [...prev, newShoe]);
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
        camera={{ position: [0, 2, 8], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          {shoes.map((shoe) => (
            <Shoe3D
              key={shoe.id}
              startPosition={shoe.startPosition}
              velocity={shoe.velocity}
              angularVelocity={shoe.angularVelocity}
              onRemove={() => removeShoe(shoe.id)}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
});

ShoeCanvas.displayName = 'ShoeCanvas';

export default ShoeCanvas;
