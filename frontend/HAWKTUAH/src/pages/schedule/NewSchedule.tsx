import React from "react";
import { Link } from "react-router-dom";

export default function NewSchedule() {
  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Horários</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar horarios
          </p>
        </div>
        <Link to="adicionar-horarios">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Horário
          </div>
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Horários..."
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-alunos">
            {" "}
            {/* TODO: Criar css e alterar tabela-alunos ?? */}
            <div>Turma</div>
            <div>info 1</div>
            <div>info 2</div>
            <div className="text-end">Ações</div>
          </div>
          <div className="px-4 py-3 border-bottom tabela-alunos">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold">
                {"-"}
              </div>
              <span className="fw-medium">{"-"}</span>
            </div>
            <div className="d-flex align-items-center gap-2 text-muted">
              <span>{"-"}</span>
            </div>
            <div className="text-muted">{"-"}</div>{" "}
            <div className="d-flex justify-content-end gap-3">
              <Link to="edit-horario">Editar</Link>
              <button className="btn btn-link text-danger p-0">Apagar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
