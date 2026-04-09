import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { useState, useCallback, memo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useBackgroundMusic } from "@/contexts/BackgroundMusicContext";

const HeaderSquirrel3D = lazy(() => import("./HeaderSquirrel3D"));

const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMuted, toggleMute } = useBackgroundMusic();

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-transparent">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-1 md:gap-1.5">
          <Suspense
            fallback={<div className="h-9 w-9 shrink-0 rounded-full bg-muted md:h-10 md:w-10" aria-hidden />}
          >
            <HeaderSquirrel3D />
          </Suspense>
          <a href="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="Логотип CLOP"
              className="h-6 w-auto md:h-8 lg:h-9"
              style={{ filter: "brightness(0)" }}
            />
          </a>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/info"
            className="px-4 py-2 font-normal uppercase transition-all duration-200"
            style={{
              fontSize: "14px",
              backgroundColor: "#f3f3f3",
              color: "#000000",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#000000";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f3f3";
              e.currentTarget.style.color = "#000000";
            }}
          >
            О нас
          </Link>
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 text-foreground transition-opacity hover:opacity-80"
            aria-label={isMuted ? "Включить звук" : "Выключить звук"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        <button
          className="text-foreground md:hidden"
          type="button"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="bg-transparent md:hidden">
          <Link
            to="/info"
            className="block px-6 py-4 font-normal uppercase transition-all duration-200"
            style={{
              fontSize: "14px",
              backgroundColor: "#f3f3f3",
              color: "#000000",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#000000";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f3f3";
              e.currentTarget.style.color = "#000000";
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            О нас
          </Link>
          <button
            type="button"
            onClick={() => {
              toggleMute();
              setIsMenuOpen(false);
            }}
            className="block w-full px-6 py-4 text-left font-normal uppercase transition-all duration-200"
            style={{
              fontSize: "14px",
              backgroundColor: "#f3f3f3",
              color: "#000000",
            }}
          >
            {isMuted ? "Звук выкл." : "Звук вкл."}
          </button>
        </nav>
      )}
    </header>
  );
});

Header.displayName = "Header";

export default Header;
