import { createContext, useContext, type RefObject } from "react";

/** Ref на скролл-контейнер главной страницы — в Safari скролл внутри div работает, document scroll нет */
export const MainScrollContext = createContext<{
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}>({ scrollContainerRef: { current: null } });

export const useMainScroll = () => useContext(MainScrollContext);
