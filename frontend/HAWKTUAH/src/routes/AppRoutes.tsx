import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/LandingPage";
import Cursos from "../pages/Cursos";
import Formandos from "../pages/Formandos";
import Perfil from "../pages/Perfil";
import Login from "../pages/Login";
import LoginLayout from "../layouts/LoginLayout"
import CreateAccount from "../pages/CreateAccount"
import ForgotPassword from "../pages/ForgotPassword"
import ResetPassword from "../pages/ResetPassword"
import NewModule from "../pages/NewModule"
import NewCourse from "../pages/NewCourse"
import NewStudent from "../pages/NewStudent"
import NewTeacher from "../pages/NewTeacher"
import NewSchedule from "../pages/NewSchedule"
import NewRoom from "../pages/NewRoom";
import AddNewStudent from "../pages/AddNewStudent";
import EditStudent from "../pages/EditStudent";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword></ForgotPassword>} />
        <Route path="create-account" element={<CreateAccount></CreateAccount>} />
        <Route path="reset-password" element={<ResetPassword></ResetPassword>} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/formandos" element={<Formandos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/gerir-modulos" element={<NewModule />} />
        <Route path="/gerir-salas" element={<NewRoom />} />
        <Route path="/gerir-cursos" element={<NewCourse />} />
        <Route path="/gerir-formandos" element={<NewStudent />} />
        <Route path="/adicionar-formandos" element={<AddNewStudent />} />
        <Route path="/gerir-formadores" element={<NewTeacher />} />
        <Route path="/gerir-horarios" element={<NewSchedule />} />
        <Route path="/gerir-formandos/edit-formando/:id" element={<EditStudent />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
