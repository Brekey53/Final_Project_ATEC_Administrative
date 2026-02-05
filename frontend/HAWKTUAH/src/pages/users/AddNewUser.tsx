import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { checkEmail, createUser } from "../../services/users/UserService";

export default function AddNewUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nome: "",
    nif: "",
    telefone: "",
    dataNascimento: "",
    sexo: "",
    morada: "",
  });

  const [loading, setLoading] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "exists" | "new">(
    "idle",
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      setEmailStatus("idle");
    }
  };

  const handleCheckEmail = async () => {
    if (!formData.email) {
      toast.error("Insira um email válido.");
      return;
    }

    setVerificandoEmail(true);

    try {
      const res = await checkEmail(formData.email);

      if (res.existe) {
        setEmailStatus("exists");
        toast.error("Este email já está registado no sistema.");
      } else {
        setEmailStatus("new");
        toast.success("Email disponível. Pode criar o utilizador.");
      }
    } catch {
      toast.error("Erro ao verificar o email.");
    } finally {
      setVerificandoEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailStatus !== "new") return;

    setLoading(true);

    try {
      await createUser(formData);
      toast.success("Utilizador criado com sucesso!");
      navigate("/gerir-utilizadores");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar utilizador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4 text-primary">Adicionar Novo Utilizador</h2>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        {/* EMAIL */}
        <div className="row align-items-end mb-4">
          <div className="col-md-8">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              disabled={emailStatus === "new"}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label invisible">Ação</label>

            {emailStatus === "idle" && (
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleCheckEmail}
                disabled={verificandoEmail}
              >
                {verificandoEmail ? "A verificar..." : "Verificar Email"}
              </button>
            )}

            {emailStatus === "exists" && (
              <div className="alert alert-danger py-2 text-center mb-0">
                Email já registado
              </div>
            )}
          </div>
        </div>

        {/* FORMULÁRIO COMPLETO */}
        {emailStatus === "new" && (
          <>
            <hr />

            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  name="nome"
                  className="form-control"
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
                  maxLength={9}
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
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Sexo</label>
                <select
                  name="sexo"
                  className="form-select"
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Data de Nascimento</label>
                <input
                  type="date"
                  name="dataNascimento"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-12 mb-4">
                <label className="form-label">Morada</label>
                <input
                  type="text"
                  name="morada"
                  className="form-control"
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
                {loading ? "A criar..." : "Criar Utilizador"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
