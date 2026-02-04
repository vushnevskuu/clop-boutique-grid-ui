import { useMemo } from "react";

/** Safari (в т.ч. iOS) — там скролл главной делаем через div; в Arc/Chrome — обычный document scroll */
export function useIsSafari(): boolean {
  return useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    // Safari без Chrome/Chromium/Edge/Arc
    const isSafariDesktop = ua.includes("Safari") && !/Chrome|Chromium|Edg|Arc/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    return isSafariDesktop || isIOS;
  }, []);
}
