import { useState, useEffect, memo } from "react";

const Loader = memo(() => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Block scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

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
      // Оптимизированная прогрессия: быстрее показываем контент
      // 30% для критических ресурсов, 20% для window load, 50% для React render
      const resourceProgress = resourcesLoaded ? 30 : (loadedCount / totalCritical) * 30;
      const windowProgress = windowLoaded ? 20 : 0;
      const renderProgress = componentsRendered ? 50 : 0;
      
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
          document.querySelector("header") ||
          document.querySelector("#shop") ||
          document.querySelector("main");
        
        if (hasContent) {
          componentsRendered = true;
          updateProgress();
          clearInterval(checkInterval);
          checkComplete();
        }
      }, 30); // Проверяем чаще (30ms вместо 50ms)

      // Stop checking after 1.5 секунды (быстрее показываем контент)
      setTimeout(() => {
        clearInterval(checkInterval);
        componentsRendered = true;
        updateProgress();
        checkComplete();
      }, 1500);
    };

    const restoreScroll = () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    const checkComplete = () => {
      // Показываем контент быстрее - не ждём все ресурсы
      // Если компоненты отрендерены, можно показывать контент
      if (componentsRendered && (resourcesLoaded || windowLoaded)) {
        setLoadingProgress(100);
        
        // Минимальная задержка для плавности
        setTimeout(() => {
          restoreScroll();
          setIsLoaded(true);
        }, 100);
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

    // Fallback: ensure we complete after reasonable time (быстрее - 3 секунды)
    const fallbackTimeout = setTimeout(() => {
      resourcesLoaded = true;
      windowLoaded = true;
      componentsRendered = true;
      setLoadingProgress(100);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setIsLoaded(true);
    }, 3000);

    return () => {
      window.removeEventListener('load', handleWindowLoad);
      clearTimeout(fallbackTimeout);
      // Гарантированно восстанавливаем скролл при размонтировании (Safari и др.)
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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
          Загрузка {loadingProgress}%
        </div>
      </div>
    </div>
  );
});

Loader.displayName = 'Loader';

export default Loader;

