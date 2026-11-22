import React from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./state/store.jsx";
import App from "./App.jsx";
import "./styles/design.css";
import "./styles/layout.css";

createRoot(document.getElementById("root")).render(
  <StoreProvider>
    <App />
  </StoreProvider>
);
