import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function removeInitialLoader() {
  const loader = document.getElementById("initial-loader");
  if (!loader) {
    document.documentElement.classList.remove("app-loading");
    return;
  }
  loader.classList.add("initial-loader--hidden");
  window.setTimeout(() => {
    loader.remove();
    document.documentElement.classList.remove("app-loading");
  }, 260);
}

window.addEventListener("iqex-app-ready", removeInitialLoader, { once: true });
window.setTimeout(removeInitialLoader, 3000);

createRoot(document.getElementById("root")!).render(<App />);
