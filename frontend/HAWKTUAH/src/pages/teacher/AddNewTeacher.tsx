import { useState } from "react";
import toast from "react-hot-toast";
import {
  postNewFormador,
  checkEmail,
} from "../../services/formador/FormadorService";
import { useNavigate } from "react-router-dom";
import FotoPlaceholder from "../../img/avatar.png"; // Garante que o import existe
import "../../css/addNewStudent.css"; // Reutilizamos o CSS de layout

export default function AddNewTeacher() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nome: "",
    nif: "",
    telefone: "",
    dataNascimento: "",
    sexo: "Masculino",
    morada: "",
    fotografia: null as File | null,
    documento: null as File | null,
  });

  const [verificandoEmail, setVerificandoEmail] = useState(false);
  // 'idle' (inicial), 'exists' (email já na BD), 'new' (email novo, precisa pass)
  const [emailStatus, setEmailStatus] = useState<"idle" | "exists" | "new">(
    "idle",
  );
  const [isExiting, setIsExiting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(FotoPlaceholder);

  const handleBackToEmail = () => {
    setIsExiting(true);
    setTimeout(() => {
      setEmailStatus("idle");
      setIsExiting(false);
    }, 400);
  };

  const handleVerificarEmail = async () => {
    if (!formData.email) {
      toast.error("Por favor, insira o email institucional.");
      return;
    }

    setVerificandoEmail(true);

    try {
      const res = await checkEmail(formData.email);

      if (res.data.existe) {
        setEmailStatus("exists");
        toast.success("Utilizador existente encontrado.");
      } else {
        setEmailStatus("new");
        toast.success("Novo email detetado. Defina uma password.");
      }
    } catch (err) {
      toast.error("Erro ao validar o email.");
    } finally {
      setVerificandoEmail(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      if (name === "fotografia") {
        setFotoPreview(URL.createObjectURL(files[0]));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        data.append(key, value as any);
      }
    });

    try {
      await postNewFormador(data);
      toast.success("Formador registado com sucesso!");
      navigate(-1); // Volta para a lista de formadores
    } catch (err: any) {
      const errorData = err.response?.data;

      if (errorData?.errors) {
        Object.values(errorData.errors)
          .flat()
          .forEach((msg: any) => {
            toast.error(msg);
          });
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error("Erro inesperado ao criar formador.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary fw-bold">Registar Novo Formador</h2>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: FOTO E DOCUMENTOS */}
        <div className="col-lg-4 text-center">
          <div className="card p-3 shadow-sm border-0 rounded-4">
            <img
              src={fotoPreview}
              alt="Preview"
              className="img-fluid rounded-4 mb-3 border"
              style={{ maxHeight: "350px", width: "100%", objectFit: "cover" }}
            />
            <label className="btn btn-outline-primary btn-sm w-100 rounded-pill mb-3">
              Carregar Fotografia
              <input
                type="file"
                name="fotografia"
                hidden
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
            <hr />
            <label className="form-label d-block text-start fw-semibold">
              Currículo / Documento (PDF/Doc)
            </label>
            <input
              type="file"
              name="documento"
              className="form-control rounded-3"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
          </div>
        </div>

        {/* COLUNA DIREITA: DADOS */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <div className="row align-items-end">
              <h5 className="text-secondary mb-3">Dados de Acesso</h5>

              <div className="col-md-7 mb-3">
                <label className="form-label">Email Institucional</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="exemplo@atec.pt"
                  onChange={handleChange}
                  disabled={emailStatus !== "idle"}
                  required
                />
              </div>

              <div className="col-md-5 mb-3">
                {emailStatus === "idle" ? (
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleVerificarEmail}
                    disabled={verificandoEmail}
                  >
                    {verificandoEmail ? "A verificar..." : "Verificar Email"}
                  </button>
                ) : emailStatus === "new" ? (
                  <>
                    <label className="form-label">Password Provisória</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </>
                ) : (
                  <div className="alert alert-success py-2 mb-0 text-center small">
                    ✅ Conta vinculada
                  </div>
                )}
              </div>

              {/* DADOS PESSOAIS */}
              {emailStatus !== "idle" && (
                <div
                  className={`row mt-3 ${isExiting ? "fade-out-section" : "fade-in-section"}`}
                >
                  <hr className="my-3" />
                  <h5 className="text-secondary mb-3">
                    Dados Profissionais e Pessoais
                  </h5>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Nome Completo</label>
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
                    <label className="form-label">Data Nascimento</label>
                    <input
                      type="date"
                      name="dataNascimento"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Telefone de Contacto</label>
                    <input
                      type="text"
                      name="telefone"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-12 mb-4">
                    <label className="form-label">Morada Completa</label>
                    <input
                      type="text"
                      name="morada"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleBackToEmail}
                    >
                      Alterar Email
                    </button>

                    <button
                      type="submit"
                      className="btn btn-success px-4"
                      disabled={loading}
                    >
                      {loading ? "A guardar..." : "Registar Formador"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
