import { useEffect, useRef, useState, useMemo, useCallback, lazy, Suspense } from "react";
import { ChevronDown } from "lucide-react";
import { useGLTF } from "@react-three/drei";
import { useMainScroll } from "@/contexts/MainScrollContext";

// Preload 3D model for faster loading
if (typeof window !== 'undefined') {
  useGLTF.preload("/model.glb");
}

// Lazy load Hero3D to improve initial page load
const Hero3D = lazy(() => import("./Hero3D"));

const Hero = () => {
  const { scrollContainerRef } = useMainScroll();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const getScrollTop = useCallback(() => {
    const el = scrollContainerRef?.current;
    return el ? el.scrollTop : window.scrollY;
  }, [scrollContainerRef]);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const windowHeight = window.innerHeight;
    const heroHeight = windowHeight * 3;
    const currentScroll = getScrollTop();
    setScrollPosition(currentScroll);
    const progress = Math.max(0, Math.min(1, currentScroll / heroHeight));
    setScrollProgress(progress);
  }, [getScrollTop]);

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
    const scrollEl = scrollContainerRef?.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => scrollEl.removeEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, scrollContainerRef]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Memoize opacity calculations to avoid recalculations
  const logoOpacity = useMemo(() => Math.max(0, 1 - scrollProgress * 3), [scrollProgress]);
  
  const textOpacity = useMemo(() => {
    if (scrollProgress < 0.15) return 0;
    if (scrollProgress > 0.7) return Math.max(0, 1 - (scrollProgress - 0.7) * 3.33);
    return Math.min(1, (scrollProgress - 0.15) * 1.82);
  }, [scrollProgress]);

  // Calculate translateY for hero to move up when second screen starts appearing
  const heroTranslateY = useMemo(() => {
    const windowHeight = window.innerHeight;
    const heroHeight = windowHeight * 3;
    
    // Start moving up when we're close to completing hero section (around 60% of scroll)
    // This makes sphere move up as second screen appears
    if (scrollProgress >= 0.6) {
      // Calculate how much we've scrolled past the 60% point
      const startMovingAt = heroHeight * 0.6;
      const scrollPastStart = Math.max(0, scrollPosition - startMovingAt);
      // Move hero up based on scroll past the start point
      // This will make it disappear above the screen as second screen appears
      return -scrollPastStart;
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
      {/* pointer-events: none — касания проходят к документу, скролл работает в Safari */}
      <div 
        className="fixed inset-0 z-0 bg-white"
        style={{
          transform: `translateY(${heroTranslateY}px)`,
          transition: 'none',
          pointerEvents: 'none',
        }}
      >
        {/* 3D Model centered - lazy loaded */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full">
            <Suspense fallback={null}>
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
      {/* pointer-events: none — касания проходят к документу, скролл работает в Safari */}
      <div 
        ref={heroRef}
        className="fixed inset-0 z-10 w-full h-screen flex items-center justify-center"
        style={{
          opacity: scrollProgress >= 1 ? 0 : 1,
          pointerEvents: 'none',
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
            className="w-auto h-20 md:h-16 lg:h-20"
            style={{
              filter: 'brightness(0) invert(1)', // Делаем логотип белым для лучшей видимости
              maxWidth: '80vw', // Ограничиваем ширину на мобильных
            }}
            loading="eager"
            fetchPriority="high"
          />
        </div>

        {/* Text - appears after logo starts disappearing */}
        <div
          className="absolute inset-0 flex items-center justify-center px-4 md:px-6"
          style={{
            opacity: textOpacity,
            transition: "opacity 0.3s ease-out"
          }}
        >
          <div className="max-w-4xl text-left px-4 md:px-6">
            <p 
              className="text-sm md:text-sm leading-[110%] text-white text-left break-words"
              style={{
                fontSize: 'clamp(13px, 3.5vw, 14px)',
                lineHeight: '120%',
                fontWeight: '500', // Немного жирнее для лучшей читаемости
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

      {/* Scroll-down arrow */}
      <div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
        style={{
          opacity: (logoOpacity > 0.5 && scrollProgress < 1) ? 1 : 0,
          pointerEvents: 'none',
          transition: "opacity 0.3s ease-out"
        }}
      >
        <ChevronDown 
          className="w-6 h-6 text-black animate-bounce" 
          strokeWidth={2.5}
          aria-hidden
        />
      </div>
    </section>
  );
};

export default Hero;
