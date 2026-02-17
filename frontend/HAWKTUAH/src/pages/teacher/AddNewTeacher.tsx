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
    iban: "",
    qualificacoes: "",
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
      setFormData({
        ...formData,
        nome: "",
        nif: "",
        telefone: "",
        dataNascimento: "",
        sexo: "Masculino",
        morada: "",
        iban: "",
        qualificacoes: "",
        password: "",
      });
      setIsExiting(false);
    }, 400);
  };

  const handleVerificarEmail = async () => {
    if (!formData.email) {
      toast.error("Insira o email institucional.", { id: "erroInsiraEmailInstusio" });
      return;
    }

    setVerificandoEmail(true);

    try {
      const res = await checkEmail(formData.email);

      if (res.data.existe) {
        setEmailStatus("exists");
        // Preencher os campos com dados da BD
        setFormData({
          ...formData,
          nome: res.data.nome || "",
          nif: res.data.nif || "",
          telefone: res.data.telefone || "",
          dataNascimento: res.data.dataNascimento || "",
          sexo: res.data.sexo || "Masculino",
          morada: res.data.morada || "",
          iban: res.data.iban || "",
          qualificacoes: res.data.qualificacoes || "",
          password: "ChangeMe123!", // Valor fictício para passar na validação do DTO se necessário
        });
        toast.success("Utilizador encontrado! Dados carregados.", { id: "successUserFind" });
      } else {
        setEmailStatus("new");
        toast.success("Novo email detetado. Defina uma password.", { id: "successMailFoundPa" });
      }
    } catch (err) {
      toast.error("Erro ao validar o email.", { id: "errorValidarEmails" });
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

    // Dados de Utilizador / Perfil
    data.append("Nome", formData.nome);
    data.append("Email", formData.email);
    data.append("Password", formData.password); // Será ignorada no backend se user existir
    data.append("Nif", formData.nif);
    data.append("Telefone", formData.telefone);
    data.append("DataNascimento", formData.dataNascimento);
    data.append("Sexo", formData.sexo);
    data.append("Morada", formData.morada);

    // Dados específicos de Formador
    data.append("Iban", formData.iban);
    data.append("Qualificacoes", formData.qualificacoes);

    if (formData.fotografia) {
      data.append("Fotografia", formData.fotografia);
    }

    if (formData.documento) {
      data.append("Documento", formData.documento);
    }

    try {
      await postNewFormador(data);
      toast.success("Formador registado com sucesso!", { id: "successRegistFormadorS" });
      navigate("/gerir-formadores"); // Volta para a lista de formadores
    } catch (err: any) {
      const errorData = err.response?.data;

      if (errorData?.errors) {
        Object.values(errorData.errors)
          .flat()
          .forEach((msg: any) => {
            toast.error(msg, { id: "errorAoCriarFormadorsa" });
          });
      } else if (errorData?.message) {
        toast.error(errorData.message, { id: "errorAoCriarFormador" });
      } else {
        toast.error("Erro inesperado ao criar formador.", { id: "erroInspFormador" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4 text-primary">Registar Novo Formador</h2>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: FOTO E DOCUMENTOS */}
        <div className="col-lg-4 d-none d-lg-block text-center">
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
                    ✅ Conta vinculada (Utilizador existente)
                  </div>
                )}
              </div>

              {/* DADOS PESSOAIS E PROFISSIONAIS (Só aparecem após verificar email) */}
              {emailStatus !== "idle" && (
                <div
                  className={`row mt-3 ${isExiting ? "fade-out-section" : "fade-in-section"}`}
                >
                  <hr className="my-3" />
                  <h5 className="text-secondary mb-3">
                    Dados Profissionais e Pessoais
                  </h5>

                  {/* Nome Completo */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Nome Completo</label>
                    {emailStatus === "exists" && (
                      <div
                        className="form-text text-muted small mb-1"
                        style={{ fontSize: "11px" }}
                      >
                        (Dados vinculados à conta. Alteração desativada.)
                      </div>
                    )}
                    <input
                      type="text"
                      name="nome"
                      className={`form-control ${emailStatus === "exists" ? "bg-light" : ""}`}
                      value={formData.nome}
                      onChange={handleChange}
                      readOnly={emailStatus === "exists"}
                      required
                    />
                  </div>

                  {/* NIF */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">NIF</label>
                    <input
                      type="text"
                      name="nif"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={9}
                      className={`form-control ${emailStatus === "exists" ? "bg-light" : ""}`}
                      value={formData.nif}
                      onChange={handleChange}
                      readOnly={emailStatus === "exists"}
                      required
                    />
                    {emailStatus === "exists" && (
                      <div
                        className="form-text text-muted"
                        style={{ fontSize: "10px", marginTop: "2px" }}
                      >
                        (Dados vinculados à conta. Alteração desativada.)
                      </div>
                    )}
                  </div>

                  {/* Sexo */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Sexo</label>
                    <select
                      name="sexo"
                      className="form-select"
                      value={formData.sexo}
                      onChange={handleChange}
                      disabled={emailStatus === "exists"}
                      required
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                    {emailStatus === "exists" && (
                      <div
                        className="form-text text-muted"
                        style={{ fontSize: "10px", marginTop: "2px" }}
                      >
                        (Dados vinculados à conta. Alteração desativada.)
                      </div>
                    )}
                  </div>

                  {/* Data Nascimento */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Data Nascimento</label>
                    <input
                      type="date"
                      name="dataNascimento"
                      className={`form-control ${emailStatus === "exists" ? "bg-light" : ""}`}
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      readOnly={emailStatus === "exists"}
                      required
                    />
                    {emailStatus === "exists" && (
                      <div
                        className="form-text text-muted"
                        style={{ fontSize: "10px", marginTop: "2px" }}
                      >
                        (Dados vinculados à conta. Alteração desativada.)
                      </div>
                    )}
                  </div>

                  {/* Morada */}
                  <div className="col-md-12 mb-4">
                    <label className="form-label">Morada Completa</label>
                    <input
                      type="text"
                      name="morada"
                      className={`form-control ${emailStatus === "exists" ? "bg-light" : ""}`}
                      value={formData.morada}
                      onChange={handleChange}
                      readOnly={emailStatus === "exists"}
                      required
                    />
                    {emailStatus === "exists" && (
                      <div
                        className="form-text text-muted"
                        style={{ fontSize: "10px", marginTop: "2px" }}
                      >
                        (Dados vinculados à conta. Alteração desativada.)
                      </div>
                    )}
                  </div>

                  {/* Contacto e IBAN */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Telefone de Contacto</label>
                    <input
                      type="tel"
                      name="telefone"
                      inputMode="tel"
                      className="form-control"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">IBAN</label>
                    <input
                      type="text"
                      name="iban"
                      autoCapitalize="characters"
                      className="form-control"
                      value={formData.iban}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Qualificações */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Qualificações</label>
                    <input
                      type="text"
                      name="qualificacoes"
                      className="form-control"
                      value={formData.qualificacoes}
                      onChange={handleChange}
                      placeholder="Ex: Licenciatura em Engenharia Informática, CCP..."
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => navigate("/gerir-formadores")}
                    >
                      Cancelar
                    </button>

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
