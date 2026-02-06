import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getUtilizador,
  updateUtilizador,
  type EditUtilizador,
} from "../../services/users/UserService";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EditUtilizador>({
    email: "",
    nome: "",
    nif: "",
    telefone: "",
    IdTipoUtilizador: 0,
    dataNascimento: "",
    sexo: "",
    morada: "",
    ativo: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const u = await getUtilizador(id);

        setFormData({
          email: u.email ?? "",
          nome: u.nome ?? "",
          nif: u.nif ?? "",
          telefone: u.telefone ?? "",
          IdTipoUtilizador: Number(u.idTipoUtilizador),
          dataNascimento: u.dataNascimento?.split("T")[0] ?? "",
          sexo: u.sexo,
          morada: u.morada ?? "",
          ativo: u.ativo,
        });
      } catch (err: any) {
        toast.error(
          err.response?.data?.message ||
            "Erro ao carregar dados do utilizador.",
          { id: "erro-dados-utilizador" },
        );
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "IdTipoUtilizador" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    const data = new FormData();
    data.append("Nome", formData.nome);
    data.append("Nif", formData.nif);
    data.append("Telefone", formData.telefone);
    data.append("IdTipoUtilizador", formData.IdTipoUtilizador.toString());
    data.append("DataNascimento", formData.dataNascimento);
    data.append("Sexo", formData.sexo);
    data.append("Morada", formData.morada);
    data.append("Status", formData.ativo ? "true" : "false");

    try {
      await updateUtilizador(id, data);
      toast.success("Perfil do Utilizador atualizado!");
      navigate(-1); // Volta para a listagem
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar dados.");
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
      <h2 className="fw-bold mb-4 text-primary">Editar Utilizador</h2>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA DIREITA: DADOS */}
        <div className="col-lg-12">
          <div className="card p-4 shadow-sm">
            <div className="row g-3 g-md-4">
              <h5 className="text-primary mb-3">
                Dados Pessoais e Profissionais
              </h5>

              <div className="col-md-12 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                />
                <div className="form-text">
                  O email não pode ser alterado por razões de segurança.
                </div>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  className="form-control"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">NIF</label>
                <input
                  type="text"
                  name="nif"
                  className="form-control"
                  value={formData.nif}
                  onChange={handleChange}
                  maxLength={9}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Sexo</label>
                <select
                  name="sexo"
                  className="form-select"
                  value={formData.sexo}
                  onChange={handleChange}
                  required
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Data de Nascimento</label>
                <input
                  type="date"
                  name="dataNascimento"
                  className="form-control"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  className="form-control"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo Utilizador</label>
                <select
                  name="IdTipoUtilizador"
                  className="form-select"
                  value={formData.IdTipoUtilizador}
                  onChange={handleChange}
                  required
                >
                  <option value={1}>Admin</option>
                  <option value={2}>Formador</option>
                  <option value={3}>Formando</option>
                  <option value={4}>Administrativo</option>
                  <option value={5}>Geral</option>
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Status Ativação de Conta</label>
                <select
                  name="ativo"
                  className="form-select"
                  value={formData.ativo ? "ativo" : "inativo"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ativo: e.target.value === "true",
                    }))
                  }
                  required
                >
                  <option value="inativo">Desativada</option>
                  <option value="ativo">Ativa</option>
                </select>
              </div>

              <div className="col-md-8 mb-3">
                <label className="form-label">Morada</label>
                <input
                  type="text"
                  name="morada"
                  className="form-control"
                  value={formData.morada}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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
