import { TDSMobileProvider } from "@toss/tds-mobile";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

const userAgent = {
  fontA11y: undefined,
  fontScale: 100,
  isAndroid: /Android/i.test(navigator.userAgent),
  isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TDSMobileProvider resetGlobalCss={false} userAgent={userAgent}>
      <App />
    </TDSMobileProvider>
  </React.StrictMode>,
);
