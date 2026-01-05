const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="grid md:grid-cols-3 gap-8 p-12">
        <div>
          <h3 className="text-2xl font-bold tracking-tighter uppercase mb-4">
            REPEAT
          </h3>
          <p className="text-background/60 text-sm">
            Platform for buying and selling 
            unique second-hand items
          </p>
        </div>
        
        <div>
          <h4 className="text-sm uppercase tracking-widest mb-4 font-bold">
            Navigation
          </h4>
          <nav className="space-y-2">
            <a href="#shop" className="block text-background/60 hover:text-accent transition-colors text-sm">
              Catalog
            </a>
            <a href="#about" className="block text-background/60 hover:text-accent transition-colors text-sm">
              About
            </a>
            <a href="#sell" className="block text-background/60 hover:text-accent transition-colors text-sm">
              Sell
            </a>
          </nav>
        </div>
        
        <div>
          <h4 className="text-sm uppercase tracking-widest mb-4 font-bold">
            Contact
          </h4>
          <div className="space-y-2 text-sm text-background/60">
            <p>hello@repeat.com</p>
            <p>+1 (555) 123-4567</p>
            <p>New York, USA</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-background/10 px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-background/40 text-xs">
          © 2025 REPEAT. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-background/40">
          <a href="#" className="hover:text-accent transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-accent transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
