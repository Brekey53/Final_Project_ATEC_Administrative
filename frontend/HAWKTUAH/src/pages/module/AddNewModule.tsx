import { useState } from "react";
import toast from "react-hot-toast";
import { postNewModulo } from "../../services/modules/ModuleService";
import { useNavigate } from "react-router-dom";

export default function AddNewModule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    codigoIdentificacao: "",
    horasTotais: 0,
    creditos: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "horasTotais" || name === "creditos" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await postNewModulo(formData);
      toast.success("Módulo criado com sucesso!");
      navigate(-1); // Volta para a listagem
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        Object.values(errorData.errors)
          .flat()
          .forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(errorData?.message || "Erro ao criar módulo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registar Novo Módulo</h2>
        <button
          className="btn btn-light border"
          onClick={() => navigate("/gerir-modulos")}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: ICONE/RESUMO */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm text-center border-0 rounded-4 bg-light">
            <div className="display-1 text-primary mb-3">
              <i className="bi bi-book"></i>
              UC/UFCD 📚
            </div>
            <h5>Informação do Módulo</h5>
            <p className="text-muted small">
              Preencha os detalhes técnicos do módulo. O código de identificação
              deve ser único (Ex: UFCD-001).
            </p>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4">Dados Técnicos</h5>

            <div className="row">
              {/* NOME DO MÓDULO */}
              <div className="col-md-12 mb-3">
                <label className="form-label fw-bold">Nome do Módulo</label>
                <input
                  type="text"
                  name="nome"
                  className="form-control form-control-lg"
                  placeholder="Ex: Programação Web"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* CÓDIGO IDENTIFICAÇÃO */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Código (UFCD / UC)</label>
                <input
                  type="text"
                  name="codigoIdentificacao"
                  className="form-control"
                  placeholder="Ex: 5412"
                  value={formData.codigoIdentificacao}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* CARGA HORÁRIA */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Horas Totais</label>
                <input
                  type="number"
                  name="horasTotais"
                  className="form-control"
                  min="0"
                  value={formData.horasTotais}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* CRÉDITOS */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Créditos</label>
                <input
                  type="number"
                  step="0.1"
                  name="creditos"
                  className="form-control"
                  min="0"
                  value={formData.creditos}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={() => navigate("/gerir-modulos")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5"
                disabled={loading}
              >
                {loading ? "A processar..." : "Criar Módulo"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
