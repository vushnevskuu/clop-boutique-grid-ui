import { Menu, X } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useLocation, Link } from "react-router-dom";

const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const isProductPage = location.pathname.startsWith('/product');

  const handleScroll = useCallback(() => {
    const windowHeight = window.innerHeight;
    const heroHeight = windowHeight * 3;
    const scrollPosition = window.scrollY;
    const progress = Math.max(0, Math.min(1, scrollPosition / heroHeight));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    if (!isProductPage) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();

      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, isProductPage]);

  // Memoize calculations
  const heroLogoOpacity = useMemo(() => Math.max(0, 1 - scrollProgress * 3), [scrollProgress]);
  const showHeaderLogo = useMemo(() => {
    // На странице продукта всегда показываем логотип и кнопку каталога
    if (isProductPage) return true;
    return heroLogoOpacity <= 0;
  }, [heroLogoOpacity, isProductPage]);
  
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
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
          <Link 
            to={isProductPage ? "/#shop" : "#shop"}
            className="px-4 py-2 uppercase font-normal transition-all duration-200"
            style={{ 
              fontSize: '14px', 
              backgroundColor: '#f3f3f3', 
              color: '#000000',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f3f3';
              e.currentTarget.style.color = '#000000';
            }}
          >
            Catalog
          </Link>
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
          <Link 
            to={isProductPage ? "/#shop" : "#shop"}
            className="block px-6 py-4 uppercase font-normal transition-all duration-200"
            style={{ 
              fontSize: '14px', 
              backgroundColor: '#f3f3f3', 
              color: '#000000',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f3f3';
              e.currentTarget.style.color = '#000000';
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            Catalog
          </Link>
        </nav>
      )}
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
