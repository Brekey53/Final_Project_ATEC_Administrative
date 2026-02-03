import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: any;
  }
}

window.fbAsyncInit = function () {
  window.FB.init({
    appId: import.meta.env.VITE_FACEBOOK_APP_ID,
    cookie: false,
    xfbml: false,
    version: "v18.0",
  });
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
