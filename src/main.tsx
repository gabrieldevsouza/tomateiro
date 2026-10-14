import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { registerPomodoroAnimationProperties } from "./features/pomodoro/registerPomodoroAnimationProperties";

import "./styles/globals.css";

registerPomodoroAnimationProperties();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
