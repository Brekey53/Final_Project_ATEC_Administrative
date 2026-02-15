import React from "react";
import "../css/login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCalendar,
  faRobot,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";

export default function LoginBanner() {
  return (
      <div className="col-12 col-lg-4 banner-login">
        <div className="ball ball-1"></div>
        <div className="container-login">
          <p className="eyebrow-login">Manager Hawk Portal</p>
          <h1 className="title-login">
            Sistema de <br />
            Gestão de Notas
          </h1>
          <p className="description-login mb-5 mt-3">
            Gerir cursos, formandos, formadores e horários
            <br />
            de forma eficiente e intuitiva.
          </p>
          <div className="cards-login ">
            <div className="row">
              <div className="col-6">
                <div className="card-login card-1">
                  <FontAwesomeIcon icon={faGraduationCap} className="icon" />
                  <p className="text-nowrap">Gestão de Alunos</p>
                </div>
              </div>
              <div className="col-6">
                <div className="card-login card-2">
                  <FontAwesomeIcon icon={faCalendar} className="icon" />
                  <p>Horários</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-6">
                <div className="card-login card-3">
                  <FontAwesomeIcon icon={faSchool} className="icon" />
                  <p className="text-nowrap">Cursos e Módulos</p>
                </div>
              </div>
              <div className="col-6">
                <div className="card-login card-4">
                  <FontAwesomeIcon icon={faRobot} className="icon" />
                  <p>Chatbot</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="ball ball-2"></div>
      </div>
  );
}
