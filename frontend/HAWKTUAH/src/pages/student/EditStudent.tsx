import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FotoPlaceholder from "../../img/avatar.png";
import {
  updateFormando,
  getFormandoById,
  getTurmas,
  getEscolaridades,
} from "../../services/students/FormandoService";

export default function EditFormando() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    nif: "",
    telefone: "",
    dataNascimento: "",
    sexo: "Masculino",
    morada: "",
    idTurma: "",
    idEscolaridade: "",
    estado: "",
    fotografia: null as File | null,
    anexoFicheiro: null as File | null,
  });

  const ESTADOS_INSCRICAO = [
    { value: "Ativo", label: "Ativo" },
    { value: "Concluido", label: "Concluido" },
    { value: "Desistente", label: "Desistente" },
    { value: "Congelado", label: "Congelado" },
    { value: "Suspenso", label: "Suspenso" },
  ] as const;

  const [turmas, setTurmas] = useState<any[]>([]);
  const [escolaridades, setEscolaridades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fotoPreview, setFotoPreview] = useState<string>(FotoPlaceholder);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Carrega dados do formando, turmas e escolaridades
        const [f, dadosTurmas, dadosEscolaridades] = await Promise.all([
          getFormandoById(id),
          getTurmas(),
          getEscolaridades(),
        ]);

        setTurmas(dadosTurmas);
        setEscolaridades(dadosEscolaridades);

        // Preenche o formulário (split na data para o formato YYYY-MM-DD)
        setFormData({
          email: f.email ?? "",
          nome: f.nome ?? "",
          nif: f.nif ?? "",
          telefone: f.telefone ?? "",
          dataNascimento: f.dataNascimento?.split("T")[0] ?? "",
          sexo: f.sexo ?? "Masculino",
          morada: f.morada ?? "",
          idTurma: f.idTurma ? String(f.idTurma) : "",
          estado: f.estado ?? "",
          idEscolaridade: f.idEscolaridade ?? "",
          fotografia: null,
          anexoFicheiro: null,
        });

        if (f.fotografia) setFotoPreview(f.fotografia);
        if (f.anexoFicheiro) setDocumentPreview(f.anexoFicheiro);
      } catch (err) {
        toast.error("Erro ao carregar dados do formando.", {
          id: "erro-formando",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    setFormData({ ...formData, [name]: file });

    const previewUrl = URL.createObjectURL(file);
    if (name === "fotografia") {
      setFotoPreview(previewUrl);
    } else {
      setDocumentPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    const data = new FormData();
    // Dados de Utilizador / Perfil
    data.append("Nome", formData.nome);
    data.append("Nif", formData.nif);
    data.append("Telefone", formData.telefone);
    data.append("DataNascimento", formData.dataNascimento);
    data.append("Sexo", formData.sexo);
    data.append("Morada", formData.morada);
    data.append("Estado", formData.estado);

    // Dados específicos de formando
    data.append("IdEscolaridade", formData.idEscolaridade);
    
    if (formData.idTurma) {
      data.append("IdTurma", formData.idTurma);
    }

    // Só anexa ficheiros se o utilizador tiver feito upload de novos (tipo File)
    if (formData.fotografia instanceof File) {
      data.append("Fotografia", formData.fotografia);
    }
    if (formData.anexoFicheiro instanceof File) {
      data.append("Documento", formData.anexoFicheiro);
    }

    try {
      await updateFormando(id, data);
      toast.success("Perfil atualizado com sucesso!");
      navigate("/gerir-formandos");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar dados.", {
        id: "err-atualizar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = () => {
    if (!documentPreview) return;

    try {
      // Extrair apenas os dados base64 (removendo o prefixo data:application/pdf;base64,)
      const base64Parts = documentPreview.split(",");
      const base64Data =
        base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];

      // Converter base64 para binário
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Criar o Blob e o URL temporário
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);

      // Abrir em nova aba
      window.open(fileURL, "_blank");
    } catch (error) {
      toast.error("Não foi possível abrir o documento.");
      console.error(error);
    }
  };

  if (fetching)
    return <div className="container mt-5">A carregar dados...</div>;

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4 text-primary">Editar Formando</h2>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: FOTO E DOCUMENTO */}
        <div className="col-lg-4 d-none d-lg-block text-center">
          <div className="card p-3 shadow-sm mb-4">
            <img
              src={fotoPreview}
              alt="Preview"
              className="img-fluid rounded mb-3"
              style={{ maxHeight: "350px", objectFit: "cover" }}
            />
            <label className="btn btn-outline-primary btn-sm">
              Alterar Fotografia
              <input
                type="file"
                name="fotografia"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="card p-3 shadow-sm">
            <label className="form-label text-start d-block fw-bold">
              Currículo / Documento
            </label>
            <input
              type="file"
              name="documento"
              className="form-control mb-3"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />

            {documentPreview && (
              <div className="mt-2 text-start">
                {documentPreview.startsWith("data:application/pdf") ||
                formData.anexoFicheiro?.type === "application/pdf" ? (
                  <iframe
                    src={documentPreview}
                    style={{
                      width: "100%",
                      height: "250px",
                      border: "1px solid #ddd",
                    }}
                    title="Preview PDF"
                  ></iframe>
                ) : (
                  <div className="p-3 bg-light border rounded mb-2 text-center">
                    <span className="text-primary fw-bold">
                      Documento Carregado
                    </span>
                    <p className="small text-muted">
                      A pré-visualização não está disponível para este formato.
                    </p>
                  </div>
                )}

                <div className="d-grid gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleOpenDocument}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Abrir em Nova Aba ↗
                  </button>
                  <a
                    href={documentPreview}
                    download={`documento_${formData.nome || "formando"}.pdf`}
                    className="btn btn-success btn-sm"
                  >
                    Descarregar Ficheiro
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: DADOS */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <div className="row">
              <h5 className="text-secondary mb-3">
                Dados de Acesso e Pessoais
              </h5>

              {/* Email */}
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

              {/* Nome Completo */}
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

              {/* NIF */}
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

              {/* Sexo */}
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

              {/* Data de Nascimento */}
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

              {/* Contacto */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Telefone de Contacto</label>
                <input
                  type="text"
                  name="telefone"
                  className="form-control"
                  value={formData.telefone}
                  onChange={handleChange}
                />
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
                  <option value="">Selecionar Nível...</option>
                  {escolaridades.map((e) => (
                    <option key={e.idEscolaridade} value={e.idEscolaridade}>
                      {e.nivel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Turma Atual</label>
                <select
                  name="idTurma"
                  className="form-select"
                  value={formData.idTurma}
                  onChange={handleChange}
                >
                  <option value="">Sem Turma Ativa</option>
                  {turmas.map((t) => (
                    <option key={t.idTurma} value={String(t.idTurma)}>
                      {t.nomeTurma}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Estado da Inscrição</label>
                <select
                  name="estado"
                  className="form-select"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="">Selecionar estado...</option>

                  {ESTADOS_INSCRICAO.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
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
                  className="form-control"
                  value={formData.morada}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                onClick={() => navigate("/gerir-formandos")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4"
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
