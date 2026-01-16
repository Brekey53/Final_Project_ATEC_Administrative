import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config.constants";
import FotoPlaceholder from "../img/avatar.png";
import { updateFormando } from "../services/UpdateStudentService";

export default function EditFormando() {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    nif: "",
    phone: "",
    dataNascimento: "",
    sexo: "Masculino",
    morada: "",
    idTurma: "",
    fotografia: null as File | null,
    anexoFicheiro: null as File | null,
  });

  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string>(FotoPlaceholder);
  const [documentPreview, setDocumemtPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [formandoRes, turmasRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/formandos/${id}`),
          axios.get(`${API_BASE_URL}/turmas`),
        ]);

        const f = formandoRes.data;
        console.log("Dados recebidos:", f); // Verifica aqui os nomes exatos das chaves

        setFormData({
          email: f.email ?? "",
          nome: f.nome ?? "",
          nif: f.nif ?? "",
          phone: f.phone ?? "",
          dataNascimento: f.dataNascimento?.split("T")[0] ?? "",
          sexo: f.sexo ?? "Masculino",
          morada: f.morada ?? "",
          idTurma: f.idTurma ?? "",
          fotografia: null,
          anexoFicheiro: null,
        });

        if (f.fotografia) {
          setFotoPreview(f.fotografia);
        }

        console.log(typeof f.AnexoFicheiro);

        if (f.anexoFicheiro) {
          setDocumemtPreview(f.anexoFicheiro);
        }

        setTurmas(turmasRes.data);
      } catch {
        toast.error("Erro ao carregar dados do formando.");
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    } else if (name === "anexoFicheiro") {
      setDocumemtPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value as any);
      }
    });

    try {
      await updateFormando(id, data);
      toast.success("Formando atualizado com sucesso!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar formando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Editar Formando</h2>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: FOTO E DOCUMENTO */}
        <div className="col-lg-4 text-center">
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
              Documento Anexo
            </label>
            <input
              type="file"
              name="anexoFicheiro"
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
                  <a
                    href={documentPreview}
                    download={`documento_${formData.nome || "formando"}.pdf`}
                    className="btn btn-success btn-sm"
                  >
                    💾 Descarregar Ficheiro
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
              <h5 className="text-primary mb-3">Dados Pessoais</h5>

              <div className="col-md-12 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                />
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
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Sexo</label>
                <select
                  name="sexo"
                  className="form-select"
                  value={formData.sexo}
                  onChange={handleChange}
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
                  value={formData.dataNascimento}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
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

              <div className="col-md-12 mb-3">
                <label className="form-label">Morada</label>
                <input
                  type="text"
                  name="morada"
                  className="form-control"
                  value={formData.morada}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => window.history.back()}
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
