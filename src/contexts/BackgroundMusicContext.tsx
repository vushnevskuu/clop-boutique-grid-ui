import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";

const MUSIC_SRC = "/music/background.mp3";

type BackgroundMusicContextType = {
  isMuted: boolean;
  toggleMute: () => void;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextType | null>(null);

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    audioRef.current.muted = next;
    if (!next && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.muted = true;
    audio.volume = 1;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <BackgroundMusicContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic(): BackgroundMusicContextType {
  const ctx = useContext(BackgroundMusicContext);
  if (!ctx) {
    return {
      isMuted: true,
      toggleMute: () => {},
    };
  }
  return ctx;
}
