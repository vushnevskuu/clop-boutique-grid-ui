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
          <div className="max-w-4xl text-center px-6">
            <p 
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                lineHeight: '1.6',
                color: 'white'
              }}
            >
              We select and collect clothing because we love it.
              <br />
              You don't need to create a new clothing brand — everything already exists.
              <br />
              Fashion is cyclical, and it's not waiting for anyone.
              <br />
              <br />
              We once thought about launching our own brand.
              <br />
              Over time, we realized something simpler: there are already countless well-made,
              <br />
              interesting pieces out there, forgotten and unused.
              <br />
              We find them and show them to you.
            </p>
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
