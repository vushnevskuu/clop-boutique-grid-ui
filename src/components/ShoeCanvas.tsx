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
  const lastAutoShoeTime = useRef(0);

  const createShoe = useCallback(() => {
    // Случайная позиция вылета снизу футера
    const randomX = (Math.random() - 0.5) * 4; // От -2 до 2
    const randomZ = Math.random() * 2 - 1; // От -1 до 1
      const startY = 0; // Начальная позиция = 0 (самый низ футера, точка вылета)
    
    // Случайная скорость вылета (как будто кинули) - для полета на 1000px вверх
    // ВАЖНО: angleY должен быть положительным для вылета ВВЕРХ
    // Масштаб: 1 единица 3D = 100 пикселей, поэтому для 1000px нужно 10 единиц
    const throwPower = 1.0 + Math.random() * 0.5; // От 1.0 до 1.5 (для полета на 1000px)
    const angleX = (Math.random() - 0.5) * 0.6; // Угол по X
    const angleY = 0.7 + Math.random() * 0.3; // Угол вверх (увеличен, всегда положительный)
    const angleZ = (Math.random() - 0.5) * 0.2; // Небольшой угол по Z
    
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
    
    console.log('Creating shoe:', newShoe);
    setShoes(prev => {
      console.log('Current shoes count:', prev.length, 'Adding new shoe');
      return [...prev, newShoe];
    });
  }, []);

  const removeShoe = useCallback((id: number) => {
    setShoes(prev => prev.filter(shoe => shoe.id !== id));
  }, []);

  // Автоматический вылет ботинка при достижении конца страницы
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Проверяем, доскроллил ли пользователь до конца (с небольшим запасом в 100px)
      const isAtBottom = scrollY + windowHeight >= documentHeight - 100;
      
      if (isAtBottom) {
        const now = Date.now();
        // Создаем ботинок автоматически с задержкой минимум 1 секунда между выбросами
        if (now - lastAutoShoeTime.current > 1000) {
          lastAutoShoeTime.current = now;
          console.log('Creating auto shoe at bottom of page');
          createShoe();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Проверяем сразу при загрузке
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [createShoe]);
  
  // Отладочная информация
  useEffect(() => {
    console.log('ShoeCanvas: shoes count:', shoes.length);
  }, [shoes.length]);

  useEffect(() => {
    onShoeCreate(createShoe);
  }, [onShoeCreate, createShoe]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '1000px',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
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
