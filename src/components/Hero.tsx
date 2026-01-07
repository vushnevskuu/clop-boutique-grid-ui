import { useEffect, useRef, useState, useMemo, useCallback, lazy, Suspense } from "react";

// Lazy load Hero3D to improve initial page load
const Hero3D = lazy(() => import("./Hero3D"));

const Hero = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const windowHeight = window.innerHeight;
    const heroHeight = windowHeight * 3;
    const currentScroll = window.scrollY;
    setScrollPosition(currentScroll);
    const progress = Math.max(0, Math.min(1, currentScroll / heroHeight));
    setScrollProgress(progress);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse position relative to center (-1 to 1)
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  // Memoize opacity calculations to avoid recalculations
  const logoOpacity = useMemo(() => Math.max(0, 1 - scrollProgress * 3), [scrollProgress]);
  
  const textOpacity = useMemo(() => {
    if (scrollProgress < 0.15) return 0;
    if (scrollProgress > 0.7) return Math.max(0, 1 - (scrollProgress - 0.7) * 3.33);
    return Math.min(1, (scrollProgress - 0.15) * 1.82);
  }, [scrollProgress]);

  // Calculate translateY for hero to move up after animations complete
  const heroTranslateY = useMemo(() => {
    const windowHeight = window.innerHeight;
    const heroHeight = windowHeight * 3;
    
    if (scrollProgress >= 1) {
      // After animations complete, start moving up immediately
      const extraScroll = Math.max(0, scrollPosition - heroHeight);
      // Move hero up based on extra scroll (1:1 with scroll speed)
      // This will make it disappear above the screen
      return -extraScroll;
    }
    return 0;
  }, [scrollProgress, scrollPosition]);


  return (
    <section 
      ref={sectionRef}
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: '300vh', position: 'relative' }} // 3 viewport heights for scrollable area
    >
      {/* Fixed Background with 3D Model - moves up after animations complete */}
      <div 
        className="fixed inset-0 z-0 bg-white"
        style={{
          transform: `translateY(${heroTranslateY}px)`,
          transition: 'none'
        }}
      >
        {/* 3D Model centered - lazy loaded */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full">
            <Suspense fallback={<div className="w-full h-full bg-white" />}>
              <Hero3D 
                modelPath="/model.glb" 
                scrollProgress={scrollProgress}
                mousePosition={mousePosition}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Fixed Content Container - moves up after animations complete */}
      <div 
        ref={heroRef}
        className="fixed inset-0 z-10 w-full h-screen flex items-center justify-center"
        style={{
          opacity: scrollProgress >= 1 ? 0 : 1,
          pointerEvents: scrollProgress >= 1 ? 'none' : 'auto',
          transform: `translateY(${heroTranslateY}px)`,
          transition: 'opacity 0.3s ease-out',
          willChange: 'transform'
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
            loading="eager"
            fetchPriority="high"
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
                fontSize: '14px',
                lineHeight: '100%',
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
