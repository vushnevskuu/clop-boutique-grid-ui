const Footer = () => {
  return (
    <footer className="w-full" style={{ display: 'block', margin: 0, padding: 0 }}>
      <img 
        src="/footer.jpg" 
        alt="Footer" 
        className="w-full h-auto object-cover"
        style={{ display: 'block', width: '100%', height: 'auto', margin: 0, padding: 0 }}
        onError={(e) => {
          console.error('Footer image failed to load:', e);
        }}
      />
    </footer>
  );
};

export default Footer;
