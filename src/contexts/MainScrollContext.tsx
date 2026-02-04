import { createContext, useContext, type RefObject } from "react";

const nullRef = { current: null as HTMLDivElement | null };

/** В Safari — скролл через div; в Arc/Chrome и др. — document scroll (useScrollContainer = false) */
export const MainScrollContext = createContext<{
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  useScrollContainer: boolean;
}>({ scrollContainerRef: nullRef, useScrollContainer: false });

export const useMainScroll = () => useContext(MainScrollContext);
