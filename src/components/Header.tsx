import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const heroHeight = windowHeight * 3; // 3 viewport heights for scrollable area
      const scrollPosition = window.scrollY;
      const progress = Math.max(0, Math.min(1, scrollPosition / heroHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logo opacity in hero: 1 -> 0 (disappears in first third of scroll)
  // Logo appears in header only after hero logo completely disappears
  const heroLogoOpacity = Math.max(0, 1 - scrollProgress * 3);
  const showHeaderLogo = heroLogoOpacity <= 0; // Show header logo only when hero logo is completely gone

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
          <a href="#shop" className="nav-link text-foreground">Catalog</a>
          <a href="#about" className="nav-link text-foreground">About</a>
          <a href="#sell" className="nav-link text-foreground">Sell</a>
        </nav>

        <button
          className="md:hidden text-foreground"
          style={{ 
            opacity: showHeaderLogo ? 1 : 0,
            transition: 'opacity 0.3s ease-out'
          }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden bg-transparent">
          <a href="#shop" className="block px-6 py-4 border-b border-foreground/20 nav-link text-foreground">
            Catalog
          </a>
          <a href="#about" className="block px-6 py-4 border-b border-foreground/20 nav-link text-foreground">
            About
          </a>
          <a href="#sell" className="block px-6 py-4 nav-link text-foreground">
            Sell
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
