import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import "./config.constants"

import { use, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { authService } from "./auth/AuthService";



function App() {

  useEffect(() => {
    // Ao regressar ao separador: se token expirou enquanto o utilizador estava noutra aba, efetua logout
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && authService.isTokenExpired()) {
        authService.handleSessionExpired();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);


  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes></AppRoutes>
    </>
  );
}

export default App;
