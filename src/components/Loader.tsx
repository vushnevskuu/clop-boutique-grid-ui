import { useState, useEffect, useRef, useCallback, memo } from "react";

const Loader = memo(() => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const prevOverflowRef = useRef<{ body: string; html: string } | null>(null);

  const unlockScroll = useCallback(() => {
    const prev = prevOverflowRef.current;
    const safe = (v: string | undefined) => {
      if (!v) return "";
      // Safari/некорректные значения могут попасть как строка "false"
      if (v === "hidden" || v === "false") return "";
      return v;
    };

    document.body.style.overflow = safe(prev?.body);
    document.documentElement.style.overflow = safe(prev?.html);
  }, []);

  useEffect(() => {
    // Block scrolling (and remember previous inline styles)
    prevOverflowRef.current = {
      body: document.body.style.overflow,
      html: document.documentElement.style.overflow,
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    let progress = 0;
    let resourcesLoaded = false;
    let windowLoaded = false;
    let componentsRendered = false;

    // Track critical resources
    const criticalResources = [
      "/logo.svg",
      "/model.glb",
      "/footer.webp",
    ];

    let loadedCount = 0;
    const totalCritical = criticalResources.length;

    const updateProgress = () => {
      // Calculate progress: 40% for resources, 30% for window load, 30% for React render
      const resourceProgress = resourcesLoaded ? 40 : (loadedCount / totalCritical) * 40;
      const windowProgress = windowLoaded ? 30 : 0;
      const renderProgress = componentsRendered ? 30 : 0;
      
      progress = Math.min(100, Math.round(resourceProgress + windowProgress + renderProgress));
      setLoadingProgress(progress);
    };

    // Load critical resources
    criticalResources.forEach((src) => {
      if (src.endsWith('.glb')) {
        // For GLB, check if it's loading
        fetch(src, { method: 'HEAD', cache: 'force-cache' })
          .then(() => {
            loadedCount++;
            if (loadedCount >= totalCritical) {
              resourcesLoaded = true;
            }
            updateProgress();
            checkComplete();
          })
          .catch(() => {
            loadedCount++;
            if (loadedCount >= totalCritical) {
              resourcesLoaded = true;
            }
            updateProgress();
            checkComplete();
          });
      } else {
        // For images
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount >= totalCritical) {
            resourcesLoaded = true;
          }
          updateProgress();
          checkComplete();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount >= totalCritical) {
            resourcesLoaded = true;
          }
          updateProgress();
          checkComplete();
        };
        img.src = src;
      }
    });

    // Check if React components are rendered
    const checkComponentsRendered = () => {
      // Wait for main content to appear (header, hero, or product grid)
      const checkInterval = setInterval(() => {
        const hasContent = 
          document.querySelector('header') ||
          document.querySelector('[class*="Hero"]') ||
          document.querySelector('[class*="ProductGrid"]') ||
          document.querySelector('main');
        
        if (hasContent) {
          componentsRendered = true;
          updateProgress();
          clearInterval(checkInterval);
          checkComplete();
        }
      }, 50);

      // Stop checking after 3 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        componentsRendered = true;
        updateProgress();
        checkComplete();
      }, 3000);
    };

    const checkComplete = () => {
      // Wait for all conditions to be met
      if (resourcesLoaded && windowLoaded && componentsRendered) {
        // Ensure we show at least 100% for a moment
        setLoadingProgress(100);
        
        // Wait a bit to ensure everything is ready, then hide loader
        setTimeout(() => {
          setIsLoaded(true);
          // Important: unlock scroll reliably (Safari can get stuck otherwise)
          unlockScroll();
        }, 200);
      }
    };

    // Track window load event
    const handleWindowLoad = () => {
      windowLoaded = true;
      updateProgress();
      checkComplete();
    };

    // Check if already loaded
    if (document.readyState === 'complete') {
      handleWindowLoad();
    } else {
      window.addEventListener('load', handleWindowLoad);
    }

    // Start checking for React components after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkComponentsRendered);
    } else {
      // DOM already ready, start checking immediately
      setTimeout(checkComponentsRendered, 100);
    }

    // Fallback: ensure we complete after reasonable time (even if something fails)
    const fallbackTimeout = setTimeout(() => {
      resourcesLoaded = true;
      windowLoaded = true;
      componentsRendered = true;
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoaded(true);
        unlockScroll();
      }, 300);
    }, 8000);

    return () => {
      window.removeEventListener('load', handleWindowLoad);
      clearTimeout(fallbackTimeout);
      unlockScroll();
    };
  }, [unlockScroll]);

  // Extra safety: if loader is hidden, ensure scroll is unlocked.
  useEffect(() => {
    if (isLoaded) unlockScroll();
  }, [isLoaded, unlockScroll]);

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
          backgroundColor: '#f3f3f3',
          padding: '12px 24px',
          borderRadius: '0',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'normal',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {loadingProgress}%
        </div>
      </div>
    </div>
  );
});

Loader.displayName = 'Loader';

export default Loader;

