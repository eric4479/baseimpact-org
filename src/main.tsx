import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { useNav } from "./lib/nav";
import "./index.css";

// Adopt the address bar before the first render.
//
// Each route ships as prerendered HTML (see scripts/prerender.mjs), so the server
// markup already reflects the requested path. The nav store, however, starts at
// "/" and only synced from `window.location` inside a useEffect — meaning the first
// client render showed the homepage and then snapped to the real route. On a deep
// link that is a visible flash of the wrong page. Syncing here makes the first
// render match the markup that is already on screen.
useNav.getState().syncFromWindow();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
