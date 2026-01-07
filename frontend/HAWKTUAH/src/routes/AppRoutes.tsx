import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/LandingPage";
import Cursos from "../pages/Cursos";
import Formandos from "../pages/Formandos";
import Perfil from "../pages/Perfil";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/formandos" element={<Formandos />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
