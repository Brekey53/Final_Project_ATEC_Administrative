import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  getTurma,
  updateTurma,
  type Turma,
  getCursos,
} from "../../services/turmas/TurmasService";
import type { Curso } from "../../services/cursos/CursosService";

export default function EditTurma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Turma>({
    idTurma: 0,
    idCurso: 0,
    nomeTurma: "",
    dataInicio: "",
    dataFim: "",
    nomeCurso: "",
    estado: "A decorrer", // Valor ficticio pois é trarado no backend
  });

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Carregamos a turma e a lista de cursos (para o select)
        const [turmaData, cursosRes] = await Promise.all([
          getTurma(id),
          getCursos(),
        ]);

        // Formatar datas para o padrão do input date (YYYY-MM-DD)
        setFormData({
          ...turmaData,
          dataInicio: turmaData.dataInicio
            ? turmaData.dataInicio.split("T")[0]
            : "",
          dataFim: turmaData.dataFim ? turmaData.dataFim.split("T")[0] : "",
        });

        setCursos(cursosRes);
      } catch (err) {
        toast.error("Erro ao carregar dados da turma.");
        navigate("/turmas");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "idCurso" ? Number(value) : value,
      nomeCurso: cursos.find((c) => c.idCurso === Number(value))?.nome || "", // apenas porque não pode ser nullo
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    try {
      await updateTurma(id, formData);
      toast.success("Turma atualizada com sucesso!");
      navigate("/turmas");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar turma.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">A carregar dados da turma...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-4 text-primary">Editar Turmas</h2>
          <p className="text-muted small mb-0">
            ID Interno: #{formData.idTurma}
          </p>
        </div>
        <button
          className="btn btn-light border rounded-pill px-4"
          onClick={() => navigate("/turmas")}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* Coluna Esquerda: Resumo */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm border-0 rounded-4 bg-light text-center h-100">
            <div className="display-1 mb-3">👥</div>
            <h5 className="fw-bold">{formData.nomeTurma || "Sem Nome"}</h5>
            <p className="text-muted small">
              Configure os períodos letivos e a associação ao curso
              correspondente.
            </p>
            <hr />
            <div className="bg-white p-3 rounded-3 text-start">
              <div className="mb-2">
                <label className="text-muted x-small d-block text-uppercase">
                  Início
                </label>
                <span className="fw-bold">{formData.dataInicio || "---"}</span>
              </div>
              <div>
                <label className="text-muted x-small d-block text-uppercase">
                  Término
                </label>
                <span className="fw-bold">{formData.dataFim || "---"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Formulário */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4 border-bottom pb-2">
              Informações da Turma
            </h5>

            <div className="row">
              {/* Nome da Turma */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Nome da Turma</label>
                <input
                  type="text"
                  name="nomeTurma"
                  className="form-control form-control-lg"
                  value={formData.nomeTurma}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Seleção de Curso */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Curso Associado
                </label>
                <select
                  name="idCurso"
                  className="form-select form-select-lg"
                  value={formData.idCurso}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um curso...</option>
                  {cursos.map((c) => (
                    <option key={c.idCurso} value={c.idCurso}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Datas */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Data de Início</label>
                <input
                  type="date"
                  name="dataInicio"
                  className="form-control"
                  value={formData.dataInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Data de Fim</label>
                <input
                  type="date"
                  name="dataFim"
                  className="form-control"
                  value={formData.dataFim}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Ações */}
            <div className="d-flex justify-content-end gap-2 mt-5">
              <button
                type="button"
                className="btn btn-light px-4 rounded-pill"
                onClick={() => navigate("/turmas")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 rounded-pill shadow-sm"
                disabled={loading}
              >
                {loading ? "A guardar..." : "Guardar Alterações"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
