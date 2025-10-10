import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initEmailJS } from "./api/emailJS";

// Initialize EmailJS
initEmailJS();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
