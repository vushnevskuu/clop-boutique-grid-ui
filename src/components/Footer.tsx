import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Footer = memo(({ onShoeCreate }: { onShoeCreate?: (setCreateFn: (fn: () => void) => void) => void }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [lastHoverTime, setLastHoverTime] = useState(0);
  const footerRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const createShoeRef = useRef<((fromCenter?: boolean) => void) | null>(null);
  const autoShoeLaunchedRef = useRef(false); // Флаг для отслеживания автоматического запуска
  const isMobile = useIsMobile();

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

  useEffect(() => {
    if (onShoeCreate) {
      onShoeCreate((createShoe: (fromCenter?: boolean) => void) => {
        createShoeRef.current = createShoe;
      });
    }
  }, [onShoeCreate]);

  // Автоматический запуск ботинка при доскролле до футера
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Если футер виден и автоматический ботинок еще не был запущен
          if (entry.isIntersecting && !autoShoeLaunchedRef.current && createShoeRef.current) {
            autoShoeLaunchedRef.current = true;
            // Небольшая задержка для более плавного эффекта
            setTimeout(() => {
              if (createShoeRef.current) {
                createShoeRef.current(true); // Первый ботинок вылетает из центра
              }
            }, 300);
          }
        });
      },
      {
        threshold: 0.3, // Футер должен быть виден минимум на 30%
        rootMargin: '0px'
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []); // Запускается только один раз при монтировании

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
    if (isMobile) return; // На мобильных не используем hover
    setIsHovered(true);
    const now = Date.now();
    
    // Создаём ботинок при входе мыши на футер (с задержкой между выбросами)
    if (now - lastHoverTime > 300 && createShoeRef.current) {
      setLastHoverTime(now);
      createShoeRef.current(false); // Остальные ботинки вылетают из случайных позиций
    }
  }, [lastHoverTime, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return; // На мобильных не используем hover
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  }, [isMobile]);

  const handleClick = useCallback(() => {
    if (!isMobile) return; // Только на мобильных
    const now = Date.now();
    
    // Создаём ботинок при клике на футер (с задержкой между выбросами)
    if (now - lastHoverTime > 300 && createShoeRef.current) {
      setLastHoverTime(now);
      createShoeRef.current(false); // Ботинки вылетают из случайных позиций
    }
  }, [lastHoverTime, isMobile]);


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
      if (!isMobile) {
        // На десктопе используем hover события
        footer.addEventListener('mousemove', handleMouseMove);
        footer.addEventListener('mouseenter', handleMouseEnter);
        footer.addEventListener('mouseleave', handleMouseLeave);
      }
      // На мобильных используем клик
      footer.addEventListener('click', handleClick);
    }

    return () => {
      if (footer) {
        if (!isMobile) {
          footer.removeEventListener('mousemove', handleMouseMove);
          footer.removeEventListener('mouseenter', handleMouseEnter);
          footer.removeEventListener('mouseleave', handleMouseLeave);
        }
        footer.removeEventListener('click', handleClick);
      }
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, handleClick, isMobile]);

  // Memoize 3D transform calculations
  const transform = useMemo(() => {
    const rotateX = mousePosition.y * 0.1;
    const rotateY = -mousePosition.x * 0.1;
    const translateZ = (Math.abs(mousePosition.x) * 5 + Math.abs(mousePosition.y) * 5) * 0.05;
    const isHovered = mousePosition.x !== 0 || mousePosition.y !== 0;
    const scale = isHovered ? 1.005 : 1;
    return `perspective(1000px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
  }, [mousePosition.x, mousePosition.y]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (footerRef.current && img.naturalHeight) {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const containerWidth = footerRef.current.offsetWidth;
      
      if (isMobile) {
        // На мобильных: изображение увеличено до 150%, высота рассчитывается с учетом этого
        // Но видимая часть остается в пределах контейнера благодаря overflow: hidden
        const calculatedHeight = containerWidth / aspectRatio;
        footerRef.current.style.height = `${calculatedHeight}px`;
      } else {
        // На десктопе: обычная высота
        const calculatedHeight = containerWidth / aspectRatio;
        footerRef.current.style.height = `${calculatedHeight}px`;
      }
    }
  }, [isMobile]);

  return (
    <footer 
      ref={footerRef}
      className="w-full" 
      style={{ 
        display: 'block', 
        margin: 0, 
        padding: 0, 
        position: 'relative', 
        zIndex: 25,
        overflow: 'hidden',
        width: '100%',
        touchAction: isMobile ? 'auto' : 'none',
        overscrollBehavior: 'none',
        backgroundColor: 'transparent',
        background: 'none',
        minHeight: isMobile ? '200px' : 'auto',
        cursor: isMobile ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img 
          ref={imgRef}
          src="/footer.webp" 
          alt="Footer" 
          className="w-full h-auto"
          style={{ 
            display: 'block', 
            position: 'relative',
            width: isMobile ? '150%' : '100%', 
            height: isMobile ? 'auto' : 'auto', 
            maxHeight: isMobile ? 'none' : 'none',
            margin: 0, 
            marginLeft: isMobile ? '-25%' : 0,
            padding: 0,
            objectFit: isMobile ? 'cover' : 'contain',
            objectPosition: 'center center',
            transform: isMobile ? 'none' : transform, // На мобильных убираем 3D трансформации
            transformOrigin: 'center center',
            transition: isMobile ? 'none' : 'transform 0.1s ease-out',
            willChange: isMobile ? 'auto' : 'transform',
            zIndex: 26,
          }}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onError={(e) => {
            console.error('Footer image failed to load:', e);
          }}
          onLoad={handleImageLoad}
        />
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
