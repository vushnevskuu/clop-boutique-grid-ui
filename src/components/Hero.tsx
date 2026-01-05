import { useEffect, useRef, useState } from "react";

const Hero = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress (0 to 1)
      // When section is at top: progress = 0
      // When section scrolls out: progress = 1
      const progress = Math.max(0, Math.min(1, -rect.top / windowHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logo opacity: 1 -> 0 (disappears as we scroll)
  const logoOpacity = Math.max(0, 1 - scrollProgress * 2);
  
  // Text opacity: 0 -> 1 -> 0
  // Text appears when logo starts disappearing (progress > 0.3)
  // Text disappears when progress > 0.7
  const textOpacity = scrollProgress < 0.3 
    ? 0 
    : scrollProgress > 0.7 
    ? Math.max(0, 1 - (scrollProgress - 0.7) * 3.33)
    : Math.min(1, (scrollProgress - 0.3) * 2.5);

  // Background image scale effect
  const backgroundScale = 1 + scrollProgress * 0.2;

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image/Video */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          transform: `scale(${backgroundScale})`,
          transition: "transform 0.1s ease-out"
        }}
      >
        <div className="w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          {/* Placeholder for video - replace with actual video element */}
          <img 
            src="/placeholder.svg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-50"
          />
          {/* Uncomment when you have a video:
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          */}
        </div>
      </div>

      {/* Content Container */}
      <div 
        ref={heroRef}
        className="relative z-10 w-full h-screen flex items-center justify-center"
      >
        {/* Logo - disappears on scroll */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: logoOpacity,
            transition: "opacity 0.3s ease-out"
          }}
        >
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64"
          >
            {/* Logo design - REPEAT brand */}
            <rect
              x="20"
              y="20"
              width="160"
              height="160"
              stroke="white"
              strokeWidth="3"
              fill="none"
              rx="8"
            />
            <text
              x="100"
              y="120"
              textAnchor="middle"
              fill="white"
              fontSize="72"
              fontWeight="bold"
              fontFamily="var(--font-heading)"
              letterSpacing="0.05em"
            >
              R
            </text>
          </svg>
        </div>

        {/* Text - appears after logo starts disappearing */}
        <div
          className="absolute inset-0 flex items-center justify-center px-6"
          style={{
            opacity: textOpacity,
            transition: "opacity 0.3s ease-out"
          }}
        >
          <div className="max-w-5xl text-center">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tighter uppercase mb-8 text-white">
              New
              <br />
              <span className="text-gray-300">life</span>
              <br />
              for things
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 max-w-md mx-auto mb-12">
              Buy and sell unique second-hand items. 
              Style without compromise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#shop" className="btn-brutal bg-white text-black hover:bg-gray-200">
                View catalog
              </a>
              <a href="#shop" className="btn-brutal-outline border-white text-white hover:bg-white hover:text-black">
                Sell items
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        style={{
          opacity: logoOpacity > 0.5 ? 1 : 0,
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
