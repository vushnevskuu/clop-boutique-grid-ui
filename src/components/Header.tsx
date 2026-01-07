import { Menu, X } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const windowHeight = window.innerHeight;
    const heroHeight = windowHeight * 3;
    const scrollPosition = window.scrollY;
    const progress = Math.max(0, Math.min(1, scrollPosition / heroHeight));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Memoize calculations
  const heroLogoOpacity = useMemo(() => Math.max(0, 1 - scrollProgress * 3), [scrollProgress]);
  const showHeaderLogo = useMemo(() => heroLogoOpacity <= 0, [heroLogoOpacity]);
  
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Header Logo - appears when hero logo disappears */}
          <a href="/">
            <img 
              src="/logo.svg" 
              alt="CLOP Logo" 
              className="w-auto h-6 md:h-8 lg:h-10"
              style={{ 
                filter: 'brightness(0)', // Make logo black
                opacity: showHeaderLogo ? 1 : 0,
                transition: 'opacity 0.3s ease-out'
              }}
            />
          </a>
        </div>

        <nav 
          className="hidden md:flex items-center gap-8"
          style={{ 
            opacity: showHeaderLogo ? 1 : 0,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          <a 
            href="#shop" 
            className="bg-gray-400 text-white px-4 py-2 uppercase font-normal transition-all duration-200 hover:bg-foreground hover:text-background"
            style={{ fontSize: '14px' }}
          >
            Catalog
          </a>
        </nav>

        <button
          className="md:hidden text-foreground"
          style={{ 
            opacity: showHeaderLogo ? 1 : 0,
            transition: 'opacity 0.3s ease-out'
          }}
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden bg-transparent">
          <a 
            href="#shop" 
            className="block px-6 py-4 bg-gray-400 text-white uppercase font-normal transition-all duration-200 hover:bg-foreground hover:text-background"
            style={{ fontSize: '14px' }}
          >
            Catalog
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
