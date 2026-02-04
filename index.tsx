import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./context/LanguageContext";

const root = document.getElementById("root")!;

createRoot(root).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
);
