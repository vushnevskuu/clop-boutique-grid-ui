import { useEffect, useRef, useState } from "react";
import Hero3D from "./Hero3D";

const Hero = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Hero section is fixed, so we calculate progress based on scroll position
      // The section has height of 3x viewport to create scrollable area
      // Progress goes from 0 (top) to 1 (bottom of hero section)
      const heroHeight = windowHeight * 3; // 3 viewport heights for scrollable area
      const scrollPosition = window.scrollY;
      const progress = Math.max(0, Math.min(1, scrollPosition / heroHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logo opacity: 1 -> 0 (disappears in first third of scroll)
  const logoOpacity = Math.max(0, 1 - scrollProgress * 3);
  
  // Text opacity: 0 -> 1 -> 0
  // Text appears when logo starts disappearing (progress > 0.15)
  // Text disappears when progress > 0.7
  const textOpacity = scrollProgress < 0.15 
    ? 0 
    : scrollProgress > 0.7 
    ? Math.max(0, 1 - (scrollProgress - 0.7) * 3.33)
    : Math.min(1, (scrollProgress - 0.15) * 1.82);

  return (
    <section 
      ref={sectionRef}
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: '300vh' }} // 3 viewport heights for scrollable area
    >
      {/* Fixed Background with 3D Model - hide after scroll completes */}
      <div 
        className="fixed inset-0 z-0 bg-white"
        style={{
          opacity: scrollProgress >= 1 ? 0 : 1,
          pointerEvents: scrollProgress >= 1 ? 'none' : 'auto',
          transition: 'opacity 0.3s ease-out'
        }}
      >
        {/* 3D Model centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full">
            <Hero3D 
              modelPath="/model.glb" 
              scrollProgress={scrollProgress}
            />
          </div>
        </div>
      </div>

      {/* Fixed Content Container - hide after scroll completes */}
      <div 
        ref={heroRef}
        className="fixed inset-0 z-10 w-full h-screen flex items-center justify-center"
        style={{
          opacity: scrollProgress >= 1 ? 0 : 1,
          pointerEvents: scrollProgress >= 1 ? 'none' : 'auto',
          transition: 'opacity 0.3s ease-out'
        }}
      >
        {/* Logo - disappears on scroll */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: logoOpacity,
            transition: "opacity 0.3s ease-out"
          }}
        >
          <img 
            src="/logo.svg" 
            alt="CLOP Logo" 
            className="w-auto h-12 md:h-16 lg:h-20"
          />
        </div>

        {/* Text - appears after logo starts disappearing */}
        <div
          className="absolute inset-0 flex items-center justify-center px-6"
          style={{
            opacity: textOpacity,
            transition: "opacity 0.3s ease-out"
          }}
        >
          <div className="max-w-4xl text-left px-6">
            <p 
              style={{
                fontSize: '20px',
                lineHeight: '1.6',
                color: 'white',
                textAlign: 'left'
              }}
            >
              We once thought about launching our own brand,
              <br />
              but realized there are already countless well-made,
              <br />
              interesting pieces out there — forgotten, unused,
              <br />
              and worth being seen.
              <br />
              Fashion is cyclical, and it's not waiting for anyone.
              <br />
              We select and collect clothing because we love it.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        style={{
          opacity: (logoOpacity > 0.5 && scrollProgress < 1) ? 1 : 0,
          pointerEvents: scrollProgress >= 1 ? 'none' : 'auto',
          transition: "opacity 0.3s ease-out"
        }}
      >
        <div className="flex flex-col items-center gap-2 text-white">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
