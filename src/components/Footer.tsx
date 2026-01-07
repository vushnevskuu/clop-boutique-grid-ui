import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";

const Footer = memo(() => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const footerRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!footerRef.current) return;
    
    const rect = footerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
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
      footer.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (footer) {
        footer.removeEventListener('mousemove', handleMouseMove);
        footer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Memoize 3D transform calculations
  const transform = useMemo(() => {
    const rotateX = mousePosition.y * 0.1;
    const rotateY = -mousePosition.x * 0.1;
    const translateZ = (Math.abs(mousePosition.x) * 5 + Math.abs(mousePosition.y) * 5) * 0.05;
    return `translateX(-50%) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
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
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        width: '100%',
        minHeight: '200px',
        touchAction: 'none',
        overscrollBehavior: 'none'
      }}
    >
      <img 
        ref={imgRef}
        src="/footer.jpg" 
        alt="Footer" 
        className="w-full h-auto object-cover"
        style={{ 
          display: 'block', 
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '120%', 
          height: '100%', 
          margin: 0, 
          padding: 0,
          objectFit: 'cover',
          transform: transform,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
          willChange: 'transform'
        }}
        loading="lazy"
        decoding="async"
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
