import { memo } from "react";
import { ChevronDown } from "lucide-react";

const Hero = memo(() => {
  return (
    <section
      className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-white px-4 pb-16 pt-24 md:px-8 md:pt-28"
      aria-label="О бренде"
    >
      <div className="mx-auto w-full max-w-4xl text-left">
        <p
          className="text-foreground break-words"
          style={{
            fontSize: "clamp(13px, 3.5vw, 14px)",
            lineHeight: "120%",
            fontWeight: 500,
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
          Fashion is cyclical, and it&apos;s not waiting for anyone.
          <br />
          We select and collect clothing because we love it.
        </p>
      </div>

      <a
        href="#shop"
        className="fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-foreground/80 transition-opacity hover:opacity-100"
        aria-label="К каталогу"
      >
        <ChevronDown className="h-6 w-6 animate-bounce" strokeWidth={2.5} aria-hidden />
      </a>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
