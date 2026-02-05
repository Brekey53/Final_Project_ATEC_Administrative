import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  postNewSala,
  getTipoSalas,
  type TipoSala,
} from "../../services/rooms/SalasService";
import { useNavigate } from "react-router-dom";

export default function AddNewRoom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tiposSala, setTiposSala] = useState<TipoSala[]>([]);

  const [formData, setFormData] = useState({
    descricao: "",
    numMaxAlunos: 0,
    idTipoSala: 0,
  });

  useEffect(() => {
    async function fetchTiposSala() {
      try {
        const data = await getTipoSalas();
        setTiposSala(data);
      } catch {
        toast.error("Erro ao carregar tipos de sala");
      }
    }

    fetchTiposSala();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "numMaxAlunos" || name === "idTipoSala"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.idTipoSala === 0) {
      toast.error("Seleciona um tipo de sala");
      return;
    }

    setLoading(true);

    try {
      await postNewSala(formData);
      toast.success("Sala criada com sucesso!");
      navigate("/gerir-salas");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar sala.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <h2 className="fw-bold mb-1 text-primary">Adicionar Nova Sala</h2>
        <button
          className="btn btn-light border"
          onClick={() => navigate("/gerir-salas")}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* COLUNA ESQUERDA */}
        <div className="col-lg-4 d-none d-lg-block">
          <div className="card p-4 shadow-sm text-center border-0 rounded-4 bg-light h-100">
            <div className="display-1 mb-3">🏫</div>
            <h5 className="fw-bold">Informação da Sala</h5>
            <p className="text-muted small">
              Define o tipo da sala, capacidade máxima e identificação.
            </p>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4">Detalhes da Sala</h5>

            <div className="row">
              {/* DESCRIÇÃO */}
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

              {/* LOTAÇÃO */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Lotação Máxima</label>
                <input
                  type="number"
                  name="numMaxAlunos"
                  className="form-control form-control-lg text-center"
                  min="5"
                  value={formData.numMaxAlunos}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* TIPO DE SALA */}
            <div className="col-md-6 mb-4">
              <label className="form-label fw-semibold">Tipo de Sala</label>
              <select
                name="idTipoSala"
                className="form-select form-select-lg"
                value={formData.idTipoSala}
                onChange={handleChange}
                required
              >
                <option value={0}>Selecionar tipo de sala</option>
                {tiposSala.map((tipo) => (
                  <option key={tipo.idTipoSala} value={tipo.idTipoSala}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* AÇÕES */}
            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light px-4 rounded-pill w-100 w-sm-auto"
                onClick={() => navigate("/gerir-salas")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 rounded-pill w-100 w-sm-auto"
                disabled={loading}
              >
                {loading ? "A criar..." : "Criar Sala"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
