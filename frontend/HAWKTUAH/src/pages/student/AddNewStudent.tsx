import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import FotoPlaceholder from "../../img/avatar.png";
import {
  postNewFormandos,
  getTurmas,
  getEscolaridades,
  checkEmail,
} from "../../services/students/FormandoService";
import "../../css/addNewStudent.css";

export default function AddNewStudent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nome: "",
    nif: "",
    telefone: "",
    dataNascimento: "",
    sexo: "Masculino",
    morada: "",
    idTurma: "", // Alterado para string para lidar com o select
    idEscolaridade: "",
    fotografia: null as File | null,
    documento: null as File | null,
  });

  const [turmas, setTurmas] = useState<any[]>([]);
  const [escolaridades, setEscolaridades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "exists" | "new">(
    "idle",
  );
  const [isExiting, setIsExiting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(FotoPlaceholder);

  // Carregar dados iniciais (Turmas e Escolaridades)
  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [dadosTurmas, dadosEscolaridades] = await Promise.all([
          getTurmas(),
          getEscolaridades(),
        ]);
        setTurmas(dadosTurmas);
        setEscolaridades(dadosEscolaridades);
      } catch (err) {
        toast.error("Erro ao carregar listas de apoio.");
      }
    }
    carregarDadosIniciais();
  }, []);

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
        idTurma: "",
        idEscolaridade: "",
        password: "",
      });
      setIsExiting(false);
    }, 400);
  };

  const handleVerificarEmail = async () => {
    if (!formData.email) {
      toast.error("Insira o email institucional.");
      return;
    }

    setVerificandoEmail(true);
    try {
      // O seu serviço já retorna res.data, então 'res' aqui já é o objeto do utilizador
      const res = await checkEmail(formData.email);

      if (res.existe) {
        setEmailStatus("exists");
        setFormData((prev) => ({
          ...prev,
          nome: res.nome || "",
          nif: res.nif || "",
          telefone: res.telefone || "",
          dataNascimento: res.dataNascimento || "",
          sexo: res.sexo || "Masculino",
          morada: res.morada || "",
          password: "USER_ALREADY_EXISTS",
        }));
        toast.success("Utilizador encontrado! Dados carregados.");
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
    data.append("Nome", formData.nome);
    data.append("Email", formData.email);
    data.append("Password", formData.password);
    data.append("Nif", formData.nif);
    data.append("Telefone", formData.telefone);
    data.append("DataNascimento", formData.dataNascimento);
    data.append("Sexo", formData.sexo);
    data.append("Morada", formData.morada);
    data.append("IdTurma", formData.idTurma);
    data.append("IdEscolaridade", formData.idEscolaridade);

    if (formData.fotografia) data.append("Fotografia", formData.fotografia);
    if (formData.documento) data.append("Documento", formData.documento);

    try {
      await postNewFormandos(data);
      toast.success("Formando criado e inscrito com sucesso!");
      navigate("/gerir-formandos"); // Volta para a lista de formadores
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Erro inesperado ao criar formando.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
     <h2 className="fw-bold mb-4 text-primary">Adicionar Novo Formando</h2>
      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: FOTO E DOCUMENTOS */}
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
                  <h5 className="text-primary mb-3">Dados Pessoais</h5>

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
                      className={`form-control ${emailStatus === "exists" ? "bg-light" : ""}`}
                      maxLength={9}
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

                  {/* Turma e Escolaridade */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Escolaridade</label>
                    <select
                      name="idEscolaridade"
                      className="form-select"
                      value={formData.idEscolaridade}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecionar...</option>
                      {escolaridades.map((e) => (
                        <option key={e.idEscolaridade} value={e.idEscolaridade}>
                          {e.nivel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Turma</label>
                    <select
                      name="idTurma"
                      className="form-select"
                      value={formData.idTurma}
                      onChange={handleChange}
                    >
                      <option value="">Sem turma</option>
                      {turmas.map((t) => (
                        <option key={t.idTurma} value={t.idTurma}>
                          {t.nomeTurma}
                        </option>
                      ))}
                    </select>
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

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => navigate("/gerir-formandos")}
                    >
                      Voltar
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
