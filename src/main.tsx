import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Preload footer image immediately
if (typeof window !== 'undefined') {
  const footerImg = new Image();
  footerImg.src = "/footer.webp";
  footerImg.loading = 'eager';
}

createRoot(document.getElementById("root")!).render(<App />);
