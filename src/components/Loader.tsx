import { useState, useEffect, memo } from "react";

const Loader = memo(() => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Block scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    let progress = 0;
    const targetProgress = 100;

    // Track critical resources
    const criticalResources = [
      "/logo.svg",
      "/model.glb",
      "/footer.webp",
    ];

    let loadedCount = 0;
    const totalCritical = criticalResources.length;

    const updateProgress = (increment: number = 0) => {
      if (increment > 0) {
        loadedCount += increment;
      }
      
      // Calculate progress: 70% for critical resources, 30% for window load
      const criticalProgress = Math.min(70, (loadedCount / totalCritical) * 70);
      const windowProgress = window.performance.timing.loadEventEnd > 0 ? 30 : 0;
      progress = Math.min(100, Math.round(criticalProgress + windowProgress));
      
      setLoadingProgress(progress);
    };

    // Load critical resources
    criticalResources.forEach((src) => {
      if (src.endsWith('.glb')) {
        // For GLB, check if it's loading
        fetch(src, { method: 'HEAD', cache: 'force-cache' })
          .then(() => {
            updateProgress(1);
            checkComplete();
          })
          .catch(() => {
            updateProgress(1);
            checkComplete();
          });
      } else {
        // For images
        const img = new Image();
        img.onload = () => {
          updateProgress(1);
          checkComplete();
        };
        img.onerror = () => {
          updateProgress(1);
          checkComplete();
        };
        img.src = src;
      }
    });

    const checkComplete = () => {
      // Check if everything is loaded
      if (document.readyState === 'complete' && loadedCount >= totalCritical) {
        setTimeout(() => {
          setLoadingProgress(100);
          setTimeout(() => {
            setIsLoaded(true);
            setTimeout(() => {
              document.body.style.overflow = '';
              document.documentElement.style.overflow = '';
            }, 300);
          }, 100);
        }, 300);
      }
    };

    // Track window load event
    const handleWindowLoad = () => {
      updateProgress();
      checkComplete();
    };

    // Check if already loaded
    if (document.readyState === 'complete') {
      handleWindowLoad();
    } else {
      window.addEventListener('load', handleWindowLoad);
    }

    // Also track DOMContentLoaded
    const handleDOMContentLoaded = () => {
      updateProgress();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    // Fallback: ensure we reach 100% after reasonable time
    const fallbackTimeout = setTimeout(() => {
      if (progress < 100) {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoaded(true);
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }, 300);
      }
    }, 5000);

    return () => {
      window.removeEventListener('load', handleWindowLoad);
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      clearTimeout(fallbackTimeout);
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
        zIndex: 99999,
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

