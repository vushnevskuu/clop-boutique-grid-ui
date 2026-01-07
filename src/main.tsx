import { createRoot } from "react-dom/client";
import { useGLTF } from "@react-three/drei";
import App from "./App.tsx";
import "./index.css";

// Preload 3D model immediately when app starts (before React renders)
if (typeof window !== 'undefined') {
  useGLTF.preload("/model.glb");
  
  // Also preload footer image
  const footerImg = new Image();
  footerImg.src = "/footer.webp";
}

createRoot(document.getElementById("root")!).render(<App />);
