import { Link } from "react-router-dom";
import {
  getFormadores,
  type Formador,
} from "../services/formador/FormadorService";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function NewTeacher() {
  const [formadores, setFormadores] = useState<Formador[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchFormadores() {
      const data = await getFormadores();
      setFormadores(data);
      setLoading(false);
    }

    fetchFormadores();
  }, []);

  const filteredFormadores = formadores.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.nome.toLowerCase().includes(term) || f.nif.toLowerCase().includes(term)
    );
  });


  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Formadores</h2>
          <p className="text-muted mb-0">
            Consultar formadores
          </p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Formadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-formadores">
            {/* TODO: Criar css e alterar tabela-alunos ?? */}
            <div>Formador</div>
            <div>Email</div>
            <div>Qualificações</div>
            <div>Nif</div>
          </div>

          {/* Map de formandores filtrados */}
          {filteredFormadores.length > 0 ? (
            filteredFormadores.map((f) => (
              <div
                key={f.idFormador}
                className="px-4 py-3 border-bottom tabela-formadores"
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                    {f.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-medium text-truncate">{f.nome}</span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{f.email || "-"}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{f.qualificacoes || "-"}</span>
                </div>

                <div className="text-muted">{f.nif || "-"}</div>
              </div>
            ))
          ) : (
            // Mensagem caso não existam resultados
            <div className="p-5 text-center text-muted">
              Nenhum formador encontrado para "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
