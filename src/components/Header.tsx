import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="flex items-center justify-between px-6 py-4">
        <a href="/" className="text-2xl font-bold tracking-tighter uppercase text-white">
          REPEAT
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#shop" className="nav-link text-white">Catalog</a>
          <a href="#about" className="nav-link text-white">About</a>
          <a href="#sell" className="nav-link text-white">Sell</a>
        </nav>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden bg-transparent">
          <a href="#shop" className="block px-6 py-4 border-b border-white/20 nav-link text-white">
            Catalog
          </a>
          <a href="#about" className="block px-6 py-4 border-b border-white/20 nav-link text-white">
            About
          </a>
          <a href="#sell" className="block px-6 py-4 nav-link text-white">
            Sell
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
