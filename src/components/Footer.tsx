import { useState, useRef, useEffect } from "react";

const Footer = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const footerRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  // Calculate 3D transform based on mouse position
  const rotateX = mousePosition.y * 5; // Max 5 degrees tilt
  const rotateY = -mousePosition.x * 5; // Max 5 degrees tilt
  const translateZ = Math.abs(mousePosition.x) * 10 + Math.abs(mousePosition.y) * 10; // Slight lift effect

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
        overflow: 'hidden'
      }}
    >
      <img 
        ref={imgRef}
        src="/footer.jpg" 
        alt="Footer" 
        className="w-full h-auto object-cover"
        style={{ 
          display: 'block', 
          width: '100%', 
          height: 'auto', 
          margin: 0, 
          padding: 0,
          minHeight: '200px',
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
          transition: 'transform 0.1s ease-out',
          willChange: 'transform'
        }}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          console.error('Footer image failed to load:', e);
        }}
        onLoad={() => {
          console.log('Footer image loaded successfully');
        }}
      />
    </footer>
  );
};

export default Footer;
