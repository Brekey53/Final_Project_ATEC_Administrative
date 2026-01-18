import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/LandingPage";
import Cursos from "../pages/course/Cursos";
import Formandos from "../pages/Formandos";
import Perfil from "../pages/Perfil";
import Login from "../pages/users/Login";
import LoginLayout from "../layouts/LoginLayout";
import CreateAccount from "../pages/users/CreateAccount";
import ForgotPassword from "../pages/users/ForgotPassword";
import ResetPassword from "../pages/users/ResetPassword";
import NewModule from "../pages/module/NewModule";
import NewCourse from "../pages/course/NewCourse";
import NewStudent from "../pages/student/NewStudent";
import NewTeacher from "../pages/teacher/NewTeacher";
import NewSchedule from "../pages/schedule/NewSchedule";
import NewRoom from "../pages/room/NewRoom";
import AddNewStudent from "../pages/student/AddNewStudent";
import EditStudent from "../pages/student/EditStudent";
import ManageUsers from "../pages/users/ManageUsers";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<Login />} />
        <Route
          path="forgot-password"
          element={<ForgotPassword></ForgotPassword>}
        />
        <Route
          path="create-account"
          element={<CreateAccount></CreateAccount>}
        />
        <Route
          path="reset-password"
          element={<ResetPassword></ResetPassword>}
        />
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
        <Route path="/gerir-utilizadores" element={<ManageUsers />} />
        <Route path="/gerir-horarios" element={<NewSchedule />} />
        <Route
          path="/gerir-formandos/edit-formando/:id"
          element={<EditStudent />}
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
