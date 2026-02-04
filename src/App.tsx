import { lazy, Suspense, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loader from "@/components/Loader";
import { BackgroundMusicProvider } from "@/contexts/BackgroundMusicContext";
import { MainScrollContext } from "@/contexts/MainScrollContext";

// Import Index directly to avoid dynamic import issues
import Index from "./pages/Index";

// Lazy load other pages for better performance
const Product = lazy(() => import("./pages/Product"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MainScrollContext.Provider value={{ scrollContainerRef: mainScrollRef }}>
          <BackgroundMusicProvider>
            <Loader />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:id" element={<Product />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </BackgroundMusicProvider>
        </MainScrollContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
