import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";

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
import CursoDetalhe from "../pages/course/CursoDetalhe";
import AddNewUser from "../pages/users/AddNewUser";
import EditUser from "../pages/users/EditUser";
import Formadores from "../pages/Formadores";

import Turmas from "../pages/turmas/ManageTurmas";
import EditTurma from "../pages/turmas/EditTurma";
import AddNewTurma from "../pages/turmas/AddNewTurma";
import EditAvaliacoesFormador from "../pages/turmas/EditAvaliacoesFormador";
import AddNewAvailability from "../pages/teacher/AddNewAvailability";

import RoleRoute from "./RoleRoute";
import NotFound from "../pages/NotFound";

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

      {/* Rotas Privadas só a utilizadores logados */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="cursos/:idCurso" element={<CursoDetalhe />} />

          {/** ADMIN e ADMINISTRATIVO */}
          <Route element={<RoleRoute permitido={[1, 4, 6]} />}>
            {/* Utilizadores - Admin, Administrativo*/}
            <Route path="/gerir-utilizadores" element={<ManageUsers />} />
            <Route
              path="/gerir-utilizadores/adicionar-utilizador"
              element={<AddNewUser />}
            />
            <Route
              path="/gerir-utilizadores/edit-utilizador/:id"
              element={<EditUser />}
            />

            {/* Formandos - Admin, Administrativo*/}
            <Route path="/adicionar-formandos" element={<AddNewStudent />} />
            <Route path="/gerir-formandos" element={<NewStudent />} />
            <Route
              path="/gerir-formandos/edit-formando/:id"
              element={<EditStudent />}
            />
            {/* Formadores - Admin, Administrativo*/}
            <Route path="/gerir-formadores" element={<NewTeacher />} />
            <Route path="/adicionar-formadores" element={<AddNewTeacher />} />
            <Route
              path="/gerir-formadores/edit-formador/:id"
              element={<EditTeacher />}
            />

            {/* Cursos - Admin, Administrativo*/}
            <Route path="/gerir-cursos" element={<NewCourse />} />
            <Route path="/adicionar-cursos" element={<AddNewCourse />} />
            <Route
              path="/gerir-cursos/edit-curso/:id"
              element={<EditCourse />}
            />

            {/* Salas - Admin, Administrativo*/}
            <Route path="/gerir-salas" element={<NewRoom />} />
            <Route path="/adicionar-salas" element={<AddNewRoom />} />
            <Route path="/gerir-salas/edit-sala/:id" element={<EditRoom />} />

            {/* Horarios - Admin, Administrativo */}
            <Route path="/gerir-horarios" element={<NewSchedule />} />

            {/* Modulos Admin, Administrativo */}
            <Route path="/gerir-modulos" element={<NewModule />} />
            <Route path="/adicionar-modulos" element={<AddNewModule />} />
            <Route
              path="/gerir-modulos/edit-modulo/:id"
              element={<EditModule />}
            />

            <Route path="/formadores" element={<Formadores />} />

            {/*TURMAS - Admin, Administrativo*/}
            <Route path="/turmas/adicionar-turma" element={<AddNewTurma />} />
            <Route path="/turmas/edit-turma/:id" element={<EditTurma />} />
          </Route>

          {/* Admin, Administrativo e Formadores */}
          <Route element={<RoleRoute permitido={[1, 2, 4, 6]} />}>
            {/* Formandos*/}
            <Route path="/formandos" element={<Formandos />} />
          </Route>

          {/*TURMAS - Públic*/}
          <Route path="/turmas" element={<Turmas />} />

          {/*Formador*/}

          <Route element={<RoleRoute permitido={[2]} />}>
            {/*Avaliaações*/}
            <Route
              path="/avaliar/:turmaId/:moduloId"
              element={<EditAvaliacoesFormador />}
            />
            {/*Disponibilidade*/}
            <Route
              path="/adicionar-disponibilidade"
              element={<AddNewAvailability />}
            />
          </Route>
          {/* 404 GLOBAL */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
