import { useState, useRef, useEffect, useMemo, useCallback, memo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Shoe3D from "./Shoe3D";

interface ShoeInstance {
  id: number;
  startPosition: [number, number, number];
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
}

const Footer = memo(() => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [shoes, setShoes] = useState<ShoeInstance[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [lastHoverTime, setLastHoverTime] = useState(0);
  const footerRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const shoeIdCounter = useRef(0);

  // Memoized handlers to prevent recreation
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!footerRef.current) return;
    
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
    
    if (isAtBottom && e.deltaY > 0) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!footerRef.current) return;
    
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
    
    if (isAtBottom) {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (footerRef.current.contains(element)) {
        e.preventDefault();
      }
    }
  }, []);

  const createShoe = useCallback(() => {
    // Случайная позиция вылета снизу футера
    const randomX = (Math.random() - 0.5) * 4; // От -2 до 2
    const randomZ = Math.random() * 2 - 1; // От -1 до 1
    const startY = -1.5; // Начальная позиция снизу
    
    // Случайная скорость вылета (как будто кинули)
    const throwPower = 0.3 + Math.random() * 0.4; // От 0.3 до 0.7
    const angleX = (Math.random() - 0.5) * 0.8; // Угол по X
    const angleY = 0.3 + Math.random() * 0.4; // Угол вверх
    const angleZ = (Math.random() - 0.5) * 0.3; // Небольшой угол по Z
    
    const velocity: [number, number, number] = [
      angleX * throwPower,
      angleY * throwPower,
      angleZ * throwPower
    ];
    
    // Случайная угловая скорость (вращение)
    const angularVelocity: [number, number, number] = [
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2
    ];
    
    const newShoe: ShoeInstance = {
      id: shoeIdCounter.current++,
      startPosition: [randomX, startY, randomZ],
      velocity,
      angularVelocity
    };
    
    setShoes(prev => [...prev, newShoe]);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!footerRef.current) return;
    
    const rect = footerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    const now = Date.now();
    
    // Создаём ботинок при входе мыши на футер (с задержкой между выбросами)
    if (now - lastHoverTime > 500) {
      setLastHoverTime(now);
      createShoe();
    }
  }, [lastHoverTime, createShoe]);

  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const removeShoe = useCallback((id: number) => {
    setShoes(prev => prev.filter(shoe => shoe.id !== id));
  }, []);

  // Prevent overscroll/bounce effect when scrolled to footer
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleWheel, handleTouchMove]);

  useEffect(() => {
    const footer = footerRef.current;
    if (footer) {
      footer.addEventListener('mousemove', handleMouseMove);
      footer.addEventListener('mouseenter', handleMouseEnter);
      footer.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (footer) {
        footer.removeEventListener('mousemove', handleMouseMove);
        footer.removeEventListener('mouseenter', handleMouseEnter);
        footer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  // Memoize 3D transform calculations
  const transform = useMemo(() => {
    const rotateX = mousePosition.y * 0.1;
    const rotateY = -mousePosition.x * 0.1;
    const translateZ = (Math.abs(mousePosition.x) * 5 + Math.abs(mousePosition.y) * 5) * 0.05;
    const isHovered = mousePosition.x !== 0 || mousePosition.y !== 0;
    const scale = isHovered ? 1.05 : 1;
    return `perspective(1000px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
  }, [mousePosition.x, mousePosition.y]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (footerRef.current && img.naturalHeight) {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const containerWidth = footerRef.current.offsetWidth;
      const calculatedHeight = containerWidth / aspectRatio;
      footerRef.current.style.height = `${calculatedHeight}px`;
    }
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="w-full" 
      style={{ 
        display: 'block', 
        margin: 0, 
        padding: 0, 
        position: 'relative', 
        zIndex: 1,
        overflow: 'hidden',
        width: '100%',
        touchAction: 'none',
        overscrollBehavior: 'none',
        backgroundColor: 'transparent',
        background: 'none',
      }}
    >
      {/* 3D Canvas для ботинок */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '400px',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 60 }}
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
      
      <img 
        ref={imgRef}
        src="/footer.webp" 
        alt="Footer" 
        className="w-full h-auto object-cover"
        style={{ 
          display: 'block', 
          position: 'relative',
          width: '100%', 
          height: 'auto', 
          margin: 0, 
          padding: 0,
          objectFit: 'contain',
          transform: transform,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
          willChange: 'transform',
          zIndex: 2,
        }}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        onError={(e) => {
          console.error('Footer image failed to load:', e);
        }}
        onLoad={handleImageLoad}
      />
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
