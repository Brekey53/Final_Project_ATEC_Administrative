import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/LandingPage";
import Cursos from "../pages/Cursos";
import Formandos from "../pages/Formandos";
import Perfil from "../pages/Perfil";
import Login from "../pages/Login";
import LoginLayout from "../layouts/LoginLayout"
import CreateAccount from "../pages/CreateAccount"
import ForgotPassword from "../pages/ForgotPassword"

function AppRoutes() {
  return (
    <Routes>
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword></ForgotPassword>} />
        <Route path="create-account" element={<CreateAccount></CreateAccount>} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/formandos" element={<Formandos />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
