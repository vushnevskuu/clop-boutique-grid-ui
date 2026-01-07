import { useState, useRef, useEffect } from "react";

const Footer = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const footerRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Prevent overscroll/bounce effect when scrolled to footer
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!footerRef.current) return;
      
      const rect = footerRef.current.getBoundingClientRect();
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      
      // If we're at the bottom and trying to scroll down, prevent it
      if (isAtBottom && e.deltaY > 0) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!footerRef.current) return;
      
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      
      // If we're at the bottom, prevent touch scrolling
      if (isAtBottom) {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Only prevent if touching the footer
        if (footerRef.current.contains(element)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!footerRef.current) return;
      
      const rect = footerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate mouse position relative to center (-1 to 1)
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

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
  }, []);

  // Calculate 3D transform based on mouse position - reduced by 95%
  const rotateX = mousePosition.y * 0.1; // 5% of original (2 * 0.05)
  const rotateY = -mousePosition.x * 0.1; // 5% of original (2 * 0.05)
  const translateZ = (Math.abs(mousePosition.x) * 5 + Math.abs(mousePosition.y) * 5) * 0.05; // 5% of original

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
          transform: `translateX(-50%) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
          willChange: 'transform'
        }}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          console.error('Footer image failed to load:', e);
        }}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (footerRef.current && img.naturalHeight) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const containerWidth = footerRef.current.offsetWidth;
            const calculatedHeight = containerWidth / aspectRatio;
            footerRef.current.style.height = `${calculatedHeight}px`;
          }
          console.log('Footer image loaded successfully');
        }}
      />
    </footer>
  );
};

export default Footer;
