import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";
import App from "./App.jsx";

// Intercept and prevent third-party browser extension errors (e.g. Web Vitals extension reportAllChanges / startTime) from breaking execution
window.addEventListener("error", (event) => {
  const msg = event?.message || "";
  if (
    msg.includes("startTime") ||
    msg.includes("reportAllChanges") ||
    (typeof event?.filename === "string" && event.filename.includes("anonymous"))
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
    return true;
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event?.reason?.message || String(event?.reason || "");
  if (reason.includes("startTime") || reason.includes("reportAllChanges")) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);