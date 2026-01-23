import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config.constants";
import toast from "react-hot-toast";
import FotoPlaceholder from "../../img/avatar.png";
import { postNewFormandos } from "../../services/AddNewStudentService";
import "../../css/addNewStudent.css";

export default function AddNewStudent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nome: "",
    nif: "",
    telefone: "",
    dataNascimento: "",
    sexo: "Masculino",
    morada: "",
    idTurma: 0,
    fotografia: null as File | null,
    documento: null as File | null,
  });

  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  // 'idle' (inicial), 'exists' (email já na BD), 'new' (email novo, precisa pass)
  const [emailStatus, setEmailStatus] = useState<"idle" | "exists" | "new">(
    "idle",
  );
  const [isExiting, setIsExiting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(FotoPlaceholder);

  // Turmas disponíveis para o seletor
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/turmas`)
      .then((res) => setTurmas(res.data))
      .catch(() => toast.error("Erro ao carregar turmas."));
  }, []);

  const handleBackToEmail = () => {
    setIsExiting(true);

    // Aguarda 400ms (tempo da animação) antes de mudar o status real
    setTimeout(() => {
      setEmailStatus("idle");
      setIsExiting(false); // Reseta para a próxima vez
    }, 400);
  };

  const handleVerificarEmail = async () => {
    if (!formData.email) {
      toast.error("Por favor, insira o email institucional.");
      return;
    }

    setVerificandoEmail(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/utilizadores/check-email?email=${formData.email}`,
      );

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
        // Se idTurma for 0 ou vazio, não enviamos ou enviamos null
        if (key === "idTurma" && (value === 0 || value === "")) return;
        data.append(key, value as any);
      }
    });

    try {
      await postNewFormandos(data);
      toast.success("Formando criado e inscrito com sucesso!");
      window.history.back();
    } catch (err: any) {
      const errorData = err.response?.data;

      if (errorData?.errors) {
        // Extrai todas as mensagens (Password, NIF, etc) e mostra no toast
        Object.values(errorData.errors)
          .flat()
          .forEach((msg: any) => {
            toast.error(msg);
          });
      }
      // Erro Manual do C#
      else if (errorData?.message) {
        toast.error(errorData.message);
      }
      // Fallback para erros genéricos
      else {
        toast.error("Erro inesperado ao criar formando.");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Registar Novo Formando</h2>
      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: FOTO E DOCUMENTOS (Fica sempre visível) */}
        <div className="col-lg-4 text-center">
          <div className="card p-3 shadow-sm">
            <img
              src={fotoPreview}
              alt="Preview"
              className="img-fluid rounded mb-3"
              style={{ maxHeight: "350px", objectFit: "cover" }}
            />
            <label className="btn btn-outline-primary btn-sm">
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
            <label className="form-label d-block text-start">
              Documento Anexo (PDF/Doc)
            </label>
            <input
              type="file"
              name="documento"
              className="form-control"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
          </div>
        </div>

        {/* COLUNA DIREITA: DADOS */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm">
            <div className="row align-items-end">
              <h5 className="text-primary mb-3">Dados de Acesso</h5>

              {/* EMAIL INSTITUCIONAL */}
              <div className="col-md-7 mb-3">
                <label className="form-label">Email Institucional</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  onChange={handleChange}
                  disabled={emailStatus !== "idle"} // Bloqueia para não mudar email após verificar
                  required
                />
              </div>

              {/* ÁREA DINÂMICA: BOTÃO OU PASSWORD (Conforme o teu desenho BTN) */}
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
                    <label className="form-label">Password Inicial</label>
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
                    ✅ Utilizador pronto
                  </div>
                )}
              </div>

              {/* DADOS PESSOAIS (Escondidos até o email ser verificado) */}
              {emailStatus !== "idle" && (
                <div
                  className={`row mt-3 ${
                    isExiting ? "fade-out-section" : "fade-in-section"
                  }`}
                >
                  <hr className="my-3" />
                  <h5 className="text-primary mb-3">Dados Pessoais</h5>

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

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Sexo:</label>
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

                  <div className="col-md-5 mb-3">
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
                    <label className="form-label">Telefone</label>
                    <input
                      type="text"
                      name="telefone"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Inscrição em Turma</label>
                    <select
                      name="idTurma"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.idTurma}
                    >
                      <option value="">Sem turma</option>
                      {turmas.map((t) => (
                        <option key={t.idTurma} value={t.idTurma}>
                          {t.nomeTurma}
                        </option>
                      ))}
                    </select>
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

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        window.history.back();
                      }}
                    >
                      Voltar
                    </button>

                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={handleBackToEmail}
                    >
                      Alterar Email
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "A processar..." : "Criar Formando"}
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
