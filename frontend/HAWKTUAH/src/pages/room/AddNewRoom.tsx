import { useState } from "react";
import toast from "react-hot-toast";
import { postNewSala } from "../../services/rooms/SalasService";
import { useNavigate } from "react-router-dom";

export default function AddNewRoom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
    numMaxAlunos: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "numMaxAlunos" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await postNewSala(formData);
      toast.success("Sala criada com sucesso!");
      navigate(-1); // Volta para a listagem
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        Object.values(errorData.errors)
          .flat()
          .forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(errorData?.message || "Erro ao criar sala.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registar Nova Sala</h2>
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: ICONE/RESUMO */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm text-center border-0 rounded-4 bg-light">
            <div className="display-1 text-primary mb-3">
              <i className="bi bi-door-open"></i>
              🚪
            </div>
            <h5>Informação da Sala</h5>
            <p className="text-muted small">
              Configure as propriedades físicas da sala. A descrição ajuda na
              identificação rápida durante o agendamento de horários.
            </p>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4">Detalhes da Sala</h5>

            <div className="row">
              {/* DESCRIÇÃO DA SALA */}
              <div className="col-md-8 mb-3">
                <label className="form-label fw-bold">
                  Descrição / Nome da Sala
                </label>
                <input
                  type="text"
                  name="descricao"
                  className="form-control form-control-lg"
                  placeholder="Ex: Sala 102 - Laboratório de Informática"
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* LOTAÇÃO MÁXIMA */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">N.º Máximo Alunos</label>
                <input
                  type="number"
                  name="numMaxAlunos"
                  className="form-control form-control-lg"
                  min="1"
                  value={formData.numMaxAlunos}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5"
                disabled={loading}
              >
                {loading ? "A processar..." : "Criar Sala"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
