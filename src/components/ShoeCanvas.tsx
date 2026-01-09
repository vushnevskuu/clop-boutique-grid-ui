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
    // Получаем реальные координаты футера на странице
    const footer = document.querySelector('footer');
    if (!footer) {
      console.warn('Footer not found, using default coordinates');
      return;
    }
    
    const footerRect = footer.getBoundingClientRect();
    const canvasRect = document.querySelector('[data-shoe-canvas]')?.getBoundingClientRect();
    
    if (!canvasRect) {
      console.warn('Canvas not found, using default coordinates');
      return;
    }
    
    // Canvas имеет position: fixed, bottom: 0, height: 1000px
    // Вычисляем, где находится низ футера относительно Canvas
    // Низ Canvas = window.innerHeight (так как bottom: 0)
    // Низ футера = footerRect.bottom
    // Разница = window.innerHeight - footerRect.bottom (положительное если футер выше низа экрана)
    
    const canvasBottom = window.innerHeight; // Низ Canvas (viewport)
    const footerBottom = footerRect.bottom; // Низ футера в пикселях от верха viewport
    const footerCenterX = footerRect.left + footerRect.width / 2; // Центр футера по X
    const canvasCenterX = window.innerWidth / 2; // Центр Canvas по X
    
    // Переводим в координаты 3D:
    // - X: горизонтальное смещение от центра (1 единица 3D = примерно 100px)
    // - Y: вертикальное смещение от низа Canvas (1 единица 3D = примерно 100px)
    //   Если футер виден, то footerBottom < canvasBottom, значит Y должен быть положительным
    //   Но нам нужно, чтобы Y=0 был на уровне низа футера
    
    const offsetY = canvasBottom - footerBottom; // Положительное = футер выше низа Canvas
    const offsetX = (footerCenterX - canvasCenterX) / 100; // Переводим пиксели в единицы 3D
    
    // В 3D координатах: Y=0 это низ футера
    // Ботинок должен стартовать ИЗ-ПОД футера, значит Y должен быть отрицательным
    const startY3D = -2; // Y = -2 (ИЗ-ПОД футера в 3D координатах)
    
    // Случайная позиция по X относительно центра футера
    const randomX = offsetX + (Math.random() - 0.5) * 1.5; // От центра футера с небольшим разбросом
    const randomZ = (Math.random() - 0.5) * 0.5; // От -0.25 до 0.25 (Z - глубина)
    
    // Случайная скорость вылета (как будто кинули) - для полета на 1000px ВВЕРХ по оси Y
    // ВАЖНО: angleY должен быть положительным для вылета ВВЕРХ по оси Y
    // Масштаб: 1 единица 3D = 100 пикселей, поэтому для 1000px нужно 10 единиц
    // Траектория должна быть дугообразной (как на рисунке)
    const throwPower = 1.0 + Math.random() * 0.5; // От 1.0 до 1.5 (увеличено для видимого вылета)
    const angleX = (Math.random() - 0.5) * 0.4; // Угол по X (горизонталь) - небольшой для дуги
    const angleY = 0.8 + Math.random() * 0.3; // Угол ВВЕРХ по Y (вертикаль/скролл, всегда положительный, увеличен)
    const angleZ = (Math.random() - 0.5) * 0.2; // Угол по Z (глубина) - для дугообразной траектории
    
    const velocity: [number, number, number] = [
      angleX * throwPower,
      angleY * throwPower, // Положительная скорость Y = вылет ВВЕРХ
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
      startPosition: [randomX, startY3D, randomZ], // X (горизонталь), Y (вертикаль/скролл - ОСЬ ДВИЖЕНИЯ), Z (глубина)
      velocity,
      angularVelocity
    };
    
    console.log('Footer coords:', { footerBottom, canvasBottom, offsetY, offsetX, startY3D });
    
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
      data-shoe-canvas
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
        camera={{ position: [0, 0, 10], fov: 75, near: 0.1, far: 100 }}
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
