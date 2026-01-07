import { useState, useEffect, memo } from "react";

const Loader = memo(() => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Track all resources loading
    const resources = [
      // Critical images
      "/logo.svg",
      "/model.glb",
      "/footer.webp",
      // Product images (lazy loaded, but we track them)
      ...Array.from({ length: 8 }, (_, i) => `/src/assets/product-${i + 1}.jpg`),
    ];

    let loadedCount = 0;
    const totalResources = resources.length;

    const updateProgress = () => {
      loadedCount++;
      const progress = Math.min(100, Math.round((loadedCount / totalResources) * 100));
      setLoadingProgress(progress);
      
      if (loadedCount >= totalResources) {
        // Wait a bit for React to fully render
        setTimeout(() => {
          setIsLoaded(true);
          // Remove loader after fade out
          setTimeout(() => {
            document.body.style.overflow = '';
          }, 300);
        }, 200);
      }
    };

    // Load critical resources
    const loadResource = (src: string) => {
      if (src.endsWith('.glb')) {
        // For GLB, use fetch
        fetch(src, { method: 'HEAD' })
          .then(() => updateProgress())
          .catch(() => updateProgress());
      } else if (src.includes('/assets/')) {
        // For imported assets, they're already in bundle, just count them
        updateProgress();
      } else {
        // For images
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = src;
      }
    };

    // Start loading resources
    resources.forEach(loadResource);

    // Also track window load event
    const handleWindowLoad = () => {
      // Ensure we reach 100% when window is loaded
      if (loadedCount < totalResources) {
        loadedCount = totalResources;
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoaded(true);
          setTimeout(() => {
            document.body.style.overflow = '';
          }, 300);
        }, 200);
      }
    };

    window.addEventListener('load', handleWindowLoad);

    // Block scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('load', handleWindowLoad);
    };
  }, []);

  if (isLoaded) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: isLoaded ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
        pointerEvents: isLoaded ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          fontSize: '48px',
          fontWeight: 'normal',
          color: '#000000',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {loadingProgress}%
      </div>
    </div>
  );
});

Loader.displayName = 'Loader';

export default Loader;

