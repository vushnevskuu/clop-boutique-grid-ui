import { createRoot } from "react-dom/client";
import { useGLTF } from "@react-three/drei";
import App from "./App.tsx";
import "./index.css";

// Preload 3D model and footer immediately when app starts (before React renders)
if (typeof window !== 'undefined') {
  // Start fetching 3D model immediately
  fetch("/model.glb", { method: 'HEAD' }).catch(() => {});
  useGLTF.preload("/model.glb");
  
  // Preload footer image
  const footerImg = new Image();
  footerImg.src = "/footer.webp";
  footerImg.loading = 'eager';
}

createRoot(document.getElementById("root")!).render(<App />);
