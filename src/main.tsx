import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { ErrorBoundary } from "./app/error-boundary";
import "./index.css";
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
