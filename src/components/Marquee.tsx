const Marquee = () => {
  const words = ["VINTAGE", "UNIQUENESS", "ECOLOGY", "STYLE", "QUALITY", "RARITY"];
  
  return (
    <div className="py-6 bg-foreground text-background overflow-hidden">
      <div className="marquee">
        <div className="marquee-content">
          {[...words, ...words].map((word, index) => (
            <span key={index} className="text-sm uppercase tracking-widest font-medium flex items-center gap-8">
              {word}
              <span className="w-2 h-2 bg-accent" />
            </span>
          ))}
        </div>
        <div className="marquee-content" aria-hidden="true">
          {[...words, ...words].map((word, index) => (
            <span key={index} className="text-sm uppercase tracking-widest font-medium flex items-center gap-8">
              {word}
              <span className="w-2 h-2 bg-accent" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
