import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background border-b border-border" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <a href="/" className={`text-2xl font-bold tracking-tighter uppercase transition-colors ${
          isScrolled ? "text-foreground" : "text-white"
        }`}>
          REPEAT
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#shop" className={`nav-link transition-colors ${
            isScrolled ? "text-foreground" : "text-white"
          }`}>Catalog</a>
          <a href="#about" className={`nav-link transition-colors ${
            isScrolled ? "text-foreground" : "text-white"
          }`}>About</a>
          <a href="#sell" className={`nav-link transition-colors ${
            isScrolled ? "text-foreground" : "text-white"
          }`}>Sell</a>
        </nav>

        <button
          className={`md:hidden transition-colors ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background">
          <a href="#shop" className="block px-6 py-4 border-b border-border nav-link">
            Catalog
          </a>
          <a href="#about" className="block px-6 py-4 border-b border-border nav-link">
            About
          </a>
          <a href="#sell" className="block px-6 py-4 nav-link">
            Sell
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
