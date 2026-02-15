import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  postNewModulo,
  getTiposMateria,
} from "../../services/modules/ModuleService";
import { useNavigate } from "react-router-dom";

export default function AddNewModule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [tiposMateria, setTiposMateria] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nome: "",
    codigoIdentificacao: "",
    horasTotais: 0,
    creditos: 0,
    idTipoMateria: 0,
  });

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await getTiposMateria();
        setTiposMateria(res);
      } catch {
        toast.error("Erro ao carregar tipos de matéria.", {
          id: "erro-carregar-modulos",
        });
      }
    };

    fetchTipos();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "horasTotais" ||
        name === "creditos" ||
        name === "idTipoMateria"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await postNewModulo(formData);
      toast.success("Módulo criado com sucesso!", {id: "sucessModuloCriado"});
      navigate(-1); // Volta para a listagem
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        Object.values(errorData.errors)
          .flat()
          .forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(errorData?.message || "Erro ao criar módulo.", {id: "errorAoCriarModulo"});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <h2 className="fw-bold mb-1 text-primary">Adicionar Novo Módulo</h2>
        <button
          className="btn btn-light border"
          onClick={() => navigate("/gerir-modulos")}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: ICONE/RESUMO */}
        <div className="col-lg-4 d-none d-lg-block text-center">
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
                  min="1"
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
                  step="1"
                  name="creditos"
                  className="form-control"
                  min="1"
                  value={formData.creditos}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label fw-bold">Tipo de Matéria</label>
                <select
                  name="idTipoMateria"
                  className="form-select"
                  value={formData.idTipoMateria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecionar</option>
                  {tiposMateria.map((tipo) => (
                    <option key={tipo.idTipoMateria} value={tipo.idTipoMateria}>
                      {tipo.tipo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
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
