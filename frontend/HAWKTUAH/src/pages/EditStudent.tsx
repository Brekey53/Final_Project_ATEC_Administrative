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
    telefone: "",
    dataNascimento: "",
    sexo: "Masculino",
    morada: "",
    idTurma: "",
    fotografia: null as File | null,
    documento: null as File | null,
  });

  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string>(FotoPlaceholder);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [formandoRes, turmasRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/formandos/${id}`),
          axios.get(`${API_BASE_URL}/turmas`),
        ]);

        const f = formandoRes.data;

        setFormData({
          email: f.email ?? "",
          nome: f.nome ?? "",
          nif: f.nif ?? "",
          telefone: f.telefone ?? "",
          dataNascimento: f.dataNascimento?.split("T")[0] ?? "",
          sexo: f.sexo ?? "Masculino",
          morada: f.morada ?? "",
          idTurma: f.idTurma ?? "",
          fotografia: null,
          documento: null,
        });

        if (f.fotografiaUrl) {
          setFotoPreview(f.fotografiaUrl);
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

    setFormData({ ...formData, [name]: files[0] });

    if (name === "fotografia") {
      setFotoPreview(URL.createObjectURL(files[0]));
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
        {/* FOTO */}
        <div className="col-lg-4 text-center">
          <div className="card p-3 shadow-sm">
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

            <hr />

            <label className="form-label text-start d-block">
              Documento Anexo
            </label>
            <input
              type="file"
              name="documento"
              className="form-control"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* DADOS */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm">
            <div className="row">
              <h5 className="text-primary mb-3">Dados Pessoais</h5>

              <div className="col-md-12 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
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
                  maxLength={9}
                  value={formData.nif}
                  onChange={handleChange}
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
                  value={formData.telefone}
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

            <div className="d-flex justify-content-end gap-2">
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
