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
import AddNewTeacher from "../pages/teacher/AddNewTeacher";
import EditTeacher from "../pages/teacher/EditTeacher";
import AddNewModule from "../pages/module/AddNewModule";
import EditModule from "../pages/module/EditModule";
import AddNewCourse from "../pages/course/AddNewCourse";
import EditCourse from "../pages/course/EditCourse";
import AddNewRoom from "../pages/room/AddNewRoom";
import EditRoom from "../pages/room/EditRoom";
import AddNewSchedule from "../pages/schedule/AddNewSchedule";
import EditSchedule from "../pages/schedule/EditSchedule";


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

        {/* Utilizadores */}
        <Route path="/gerir-utilizadores" element={<ManageUsers />} />
        <Route path="/perfil" element={<Perfil />} />

        {/* Formandos */}
        <Route path="/formandos" element={<Formandos />} />
        <Route path="/adicionar-formandos" element={<AddNewStudent />} />
        <Route path="/gerir-formandos" element={<NewStudent />} />
        <Route
          path="/gerir-formandos/edit-formando/:id"
          element={<EditStudent />}
        />

        {/* Formadores */}
        <Route path="/gerir-formadores" element={<NewTeacher />} />
        <Route path="/adicionar-formadores" element={<AddNewTeacher />} />
        <Route
          path="/gerir-formadores/edit-formadores/:id"
          element={<EditTeacher />}
        />

        {/* Modulos */}
        <Route path="/gerir-modulos" element={<NewModule />} />
        <Route path="/adicionar-modulos" element={<AddNewModule />} />
        <Route
          path="/gerir-modulos/edit-modulos/:id"
          element={<EditModule />}
        />

        {/* Cursos */}
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/gerir-cursos" element={<NewCourse />} />
        <Route path="/adicionar-cursos" element={<AddNewCourse />} />
        <Route
          path="/gerir-cursos/edit-cursos/:id"
          element={<EditCourse />}
        />

        {/* Salas */}
        <Route path="/gerir-salas" element={<NewRoom />} />
        <Route path="/adicionar-salas" element={<AddNewRoom />} />
        <Route
          path="/gerir-salas/edit-salas/:id"
          element={<EditRoom />}
        />

        {/* Horarios */}
        <Route path="/gerir-horarios" element={<NewSchedule />} />
        <Route path="/adicionar-horarios" element={<AddNewSchedule />} />
        <Route
          path="/gerir-horarios/edit-horarios/:id"
          element={<EditSchedule />}
        />


      </Route>
    </Routes>
  );
}

export default AppRoutes;
