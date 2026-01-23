import React from 'react'

import {useState} from "react"

import Cursos from "../../pages/course/Cursos"
import Horarios from "../../pages/schedule/Schedules"

export default function FormandoDashboard() {
    type Tab = "cursos" | "horarios";
    const [activeTab, setActiveTab] = useState<Tab>("cursos");
  return (
        <div className="container my-5">
          <h2>Dashboard</h2>
          <div className="dashboard-pesquisa shadow p-4">
            <form className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Pesquisar curso"
              />
              <button type="submit" className="btn btn-primary">
                Pesquisar
              </button>
            </form>
          </div>
          <div>
            <div className="d-flex justify-content-around mt-5 tab-div">
              <button
                className={activeTab === "cursos" ? "tab-active" : ""}
                onClick={() => setActiveTab("cursos")}
              >
                Cursos
              </button>
    
              <button
                className={activeTab === "horarios" ? "tab-active" : ""}
                onClick={() => setActiveTab("horarios")}
              >
                Horários
              </button>
            </div>
            <div className="mt-4">
              {activeTab === "cursos" && <Cursos />}
              {activeTab === "horarios" && <Horarios />}
            </div>
          </div>
        </div>
  )
}
