const About = () => {
  return (
    <section id="about" className="grid md:grid-cols-2">
      <div className="bg-foreground text-background p-12 md:p-20 flex flex-col justify-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-8">
          Why
          <br />
          second-hand?
        </h2>
        <ul className="space-y-4 text-background/80">
          <li className="flex items-start gap-4">
            <span className="w-2 h-2 bg-accent mt-2 flex-shrink-0" />
            <span>Unique items you won't find in mass market</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-2 h-2 bg-accent mt-2 flex-shrink-0" />
            <span>Eco-friendly choice — giving clothes a second life</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-2 h-2 bg-accent mt-2 flex-shrink-0" />
            <span>Quality brands at affordable prices</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-2 h-2 bg-accent mt-2 flex-shrink-0" />
            <span>Verified sellers and authenticity guarantee</span>
          </li>
        </ul>
      </div>
      
      <div id="sell" className="p-12 md:p-20 flex flex-col justify-center border-b border-border">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-8">
          Sell
          <br />
          yours
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Clean out your wardrobe — earn from what you don't need. We'll help you sell your items quickly and profitably.
        </p>
        <a href="#" className="btn-brutal w-fit">
          Start selling
        </a>
      </div>
    </section>
  );
};

export default About;
