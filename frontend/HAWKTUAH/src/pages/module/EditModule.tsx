import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getModulo,
  updateModulo,
  type ModulosEdit,
} from "../../services/modules/ModuleService";

export default function EditModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ModulosEdit>({
    idModulo: 0,
    codigoIdentificacao: "",
    nome: "",
    horasTotais: 0,
    creditos: 0,
    idTipoMateria: 0,
    nomeTipoMateria: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await getModulo(id);

        setFormData(res);
      } catch (err) {
        toast.error("Erro ao carregar dados do módulo.", {
          id: "erro-modulos",
        });
        navigate("/gerir-modulos");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Converter para número se os campos forem de horas ou créditos
    const val =
      name === "horasTotais" || name === "creditos" ? Number(value) : value;

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
      await updateModulo(id, formData);
      toast.success("Módulo atualizado com sucesso!", {id: "sucessAtualizarModulos"});
      navigate("/gerir-modulos");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar módulo.", {
        id: "erro-gerir-modulos",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="container mt-5 text-center">A carregar dados...</div>
    );

  return (
    <div className="container mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <h2 className="fw-bold mb-1">
          Editar Módulo: <span className="text-primary">{formData.nome}</span>
        </h2>
        <button
          className="btn btn-light border"
          onClick={() => navigate("/gerir-modulos")}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: RESUMO/ÍCONE */}
        <div className="col-lg-4 d-none d-lg-block">
          <div className="card p-4 shadow-sm text-center border-0 rounded-4 bg-light h-100">
            <div className="display-1 text-primary mb-3">📚</div>
            <h5>Configuração Técnica</h5>
            <p className="text-muted small">
              Altere o nome, a carga horária ou os créditos atribuídos a este
              módulo.
            </p>
            <hr />
            <div className="text-start">
              <p className="mb-1 small">
                <strong>ID Interno:</strong> {formData.idModulo}
              </p>
              <p className="mb-0 small">
                <strong>Código:</strong> {formData.codigoIdentificacao}
              </p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: CAMPOS DE EDIÇÃO */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4">Detalhes do Módulo</h5>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label fw-bold">Nome do Módulo</label>
                <input
                  type="text"
                  name="nome"
                  className="form-control form-control-lg"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Código Identificação
                </label>
                <input
                  type="text"
                  name="codigoIdentificacao"
                  className="form-control text-muted bg-light"
                  value={formData.codigoIdentificacao}
                  disabled // Geralmente o código único não deve ser alterado após criação
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Horas Totais</label>
                <input
                  type="number"
                  name="horasTotais"
                  className="form-control"
                  value={formData.horasTotais}
                  onChange={handleChange}
                  min="25"
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Créditos</label>
                <input
                  type="number"
                  step="0.5"
                  name="creditos"
                  className="form-control"
                  value={formData.creditos}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label fw-bold">
                  Tipo de Matéria
                </label>
                <input
                  type="text"
                  name="nomeTipoMateria"
                  className="form-control text-muted bg-light"
                  value={formData.nomeTipoMateria}
                  disabled
                />
                <small className="text-muted">Não é possível alterar para não comprometer módulos de turmas atuais</small>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light px-5 w-100 w-sm-auto"
                onClick={() => navigate("/gerir-modulos")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 w-100 w-sm-auto"
                disabled={loading}
              >
                {loading ? "A atualizar..." : "Guardar Alterações"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
