import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function removeInitialLoader() {
  const loader = document.getElementById("initial-loader");
  if (!loader) return;
  loader.classList.add("initial-loader--hidden");
  window.setTimeout(() => loader.remove(), 260);
}

window.addEventListener("iqex-app-ready", removeInitialLoader, { once: true });
window.setTimeout(removeInitialLoader, 6000);

createRoot(document.getElementById("root")!).render(<App />);
