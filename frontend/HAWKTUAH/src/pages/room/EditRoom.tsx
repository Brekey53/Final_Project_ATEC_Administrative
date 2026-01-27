import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getSala,
  updateSala,
  type Salas,
} from "../../services/rooms/SalasService";

export default function EditRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Salas>({
    idSala: 0,
    descricao: "",
    numMaxAlunos: 0,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await getSala(id);

        setFormData(res);
      } catch (err) {
        toast.error("Erro ao carregar dados da Sala.");
        navigate("/gerir-salas");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Converter para número
    const val = name === "numMaxAlunos" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    try {
      await updateSala(id, formData);
      toast.success("Sala atualizada com sucesso!");
      navigate("/gerir-salas");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar sala.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">A carregar...</span>
        </div>
        <p className="mt-2 text-muted">A carregar dados da sala...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Editar Sala</h2>
          <p className="text-muted small mb-0">ID da Sala: {formData.idSala}</p>
        </div>
        <button
          className="btn btn-light border"
          onClick={() => navigate("/gerir-salas")}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* Coluna Esquerda: Resumo Visual */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm border-0 rounded-4 bg-light text-center h-100">
            <div className="display-1 mb-3">🏫</div>
            <h5 className="fw-bold">{formData.descricao || "Nova Sala"}</h5>
            <p className="text-muted small">
              Utilize esta secção para configurar a identificação da sala e a
              sua capacidade máxima de ocupação.
            </p>
            <hr />
            <div className="bg-white p-3 rounded-3 shadow-xs text-start">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Capacidade:</span>
                <span className="badge bg-primary rounded-pill">
                  {formData.numMaxAlunos} alunos
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Estado:</span>
                <span className="text-success small fw-bold">
                  Disponível
                </span>{" "}
                {/* TODO: Queres deixar isto aqui? */}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Formulário */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4 border-bottom pb-2">
              Informações Gerais
            </h5>

            <div className="row">
              {/* Descrição da Sala */}
              <div className="col-md-8 mb-3">
                <label className="form-label fw-semibold">
                  Nome / Descrição da Sala
                </label>
                <input
                  type="text"
                  name="descricao"
                  className="form-control form-control-lg"
                  placeholder="Ex: Sala 102 - Laboratório"
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Lotação Máxima */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Lotação Máxima</label>
                <input
                  type="number"
                  name="numMaxAlunos"
                  className="form-control form-control-lg text-center" // Adicionado text-center para melhor leitura
                  value={formData.numMaxAlunos}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <div className="form-text text-muted">
                  Capacidade total de alunos.
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="d-flex justify-content-end gap-2 mt-5">
              <button
                type="button"
                className="btn btn-light px-4 rounded-pill"
                onClick={() => navigate("/gerir-salas")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 rounded-pill shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    A guardar...
                  </>
                ) : (
                  "Guardar Alterações"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
