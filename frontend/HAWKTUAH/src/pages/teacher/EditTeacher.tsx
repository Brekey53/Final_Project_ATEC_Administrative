import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FotoPlaceholder from "../../img/avatar.png";
import {
  updateFormador,
  getFormador,
  getTiposMateria,
} from "../../services/formador/FormadorService";

export default function EditTeacher() {
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
    iban: "",
    qualificacoes: "",
    fotografia: null as File | null,
    documento: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fotoPreview, setFotoPreview] = useState<string>(FotoPlaceholder);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  const [tiposMateria, setTiposMateria] = useState<any[]>([]);
  const [tiposSelecionados, setTiposSelecionados] = useState<number[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState<number | "">("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [resFormador, resTiposMateria] = await Promise.all([
          getFormador(id),
          getTiposMateria(),
        ]);

        const f = resFormador.data;

        setTiposMateria(resTiposMateria);

        setTiposSelecionados(
          (f.tiposMateria ?? []).map((t: any) => t.idTipoMateria),
        );

        setFormData({
          email: f.email ?? "",
          nome: f.nome ?? "",
          nif: f.nif ?? "",
          telefone: f.telefone ?? "",
          dataNascimento: f.dataNascimento?.split("T")[0] ?? "",
          sexo: f.sexo ?? "Masculino",
          morada: f.morada ?? "",
          iban: f.iban ?? "",
          qualificacoes: f.qualificacoes ?? "",
          fotografia: null,
          documento: null,
        });

        if (f.fotografia) setFotoPreview(f.fotografia);
        if (f.anexoFicheiro) setDocumentPreview(f.anexoFicheiro);
      } catch {
        toast.error("Erro ao carregar dados do formador.");
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
    } else if (name === "documento") {
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

    // Dados específicos de Formador
    data.append("Iban", formData.iban);
    data.append("Qualificacoes", formData.qualificacoes);

    // Ficheiros: Só anexar se forem novos (instância de File)
    if (formData.fotografia instanceof File) {
      data.append("Fotografia", formData.fotografia);
    }
    if (formData.documento instanceof File) {
      data.append("Documento", formData.documento);
    }
    tiposSelecionados.forEach((idTipo) => {
      data.append("TiposMateria", idTipo.toString());
    });
    try {
      await updateFormador(id, data);
      toast.success("Perfil do formador atualizado!");
      navigate("/gerir-formadores"); // Volta para a listagem
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar dados.", {
        id: "erro-edit-teacher",
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

  const tiposAssociados = tiposMateria.filter((t) =>
    tiposSelecionados.includes(t.idTipoMateria),
  );

  const tiposDisponiveis = tiposMateria.filter(
    (t) => !tiposSelecionados.includes(t.idTipoMateria),
  );

  if (fetching)
    return (
      <div className="container mt-5 text-center">A carregar dados...</div>
    );

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4 text-primary">Editar Formador</h2>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: FOTO E DOCUMENTO */}
        <div className="col-lg-4 d-none d-lg-block text-center">
          <div className="card p-3 shadow-sm mb-4">
            {/*TODO: tirar inline css */}
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
                formData.documento?.type === "application/pdf" ? (
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
          <div className="card p-4 shadow-sm">
            <div className="row">
              <h5 className="text-primary mb-3">
                Dados Pessoais e Profissionais
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
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="form-control"
                  maxLength={9}
                  value={formData.nif}
                  onChange={handleChange}
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

              {/* Morada */}
              <div className="col-md-12 mb-4">
                <label className="form-label">Morada Completa</label>
                <input
                  type="text"
                  name="morada"
                  className="form-control bg-light"
                  value={formData.morada}
                  onChange={handleChange}
                  required
                />
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
                  inputMode="text"
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
            </div>

            <div className="col-md-12 mb-4">
              <label className="form-label">
                Tipos de Matéria que o formador dá
              </label>

              <div className="row">
                {/* ASSOCIADOS */}
                <div className="col-md-6">
                  <small className="text-muted">Associados</small>
                  <ul className="list-group mb-3">
                    {tiposAssociados.length === 0 && (
                      <li className="list-group-item text-muted small">
                        Nenhum tipo associado
                      </li>
                    )}

                    {tiposAssociados.map((tm) => (
                      <li
                        key={tm.idTipoMateria}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span className="fw-semibold">{tm.tipo}</span>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            setTiposSelecionados((prev) =>
                              prev.filter((id) => id !== tm.idTipoMateria),
                            )
                          }
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DISPONÍVEIS */}
                <div className="col-md-6">
                  <small className="text-muted">Disponíveis</small>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select"
                      value={tipoSelecionado}
                      disabled={tiposDisponiveis.length === 0}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTipoSelecionado(value ? Number(value) : "");
                      }}
                    >
                      <option value="">Adicionar tipo de matéria</option>

                      {tiposDisponiveis.map((tm) => (
                        <option key={tm.idTipoMateria} value={tm.idTipoMateria}>
                          {tm.tipo}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      disabled={!tipoSelecionado}
                      onClick={() => {
                        setTiposSelecionados((prev) =>
                          prev.includes(tipoSelecionado as number)
                            ? prev
                            : [...prev, tipoSelecionado as number],
                        );
                        setTipoSelecionado("");
                      }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => navigate("/gerir-formadores")}
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
