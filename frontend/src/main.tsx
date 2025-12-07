// frontend/src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./AppRouter";
import "./index.css";
import { ToastProvider } from "./components/Toast";
import { useThemeStore } from "./state/useThemeStore";

// Ensure theme initialization runs once (applyHtmlClass is inside the store)
useThemeStore.getState();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </React.StrictMode>
);
