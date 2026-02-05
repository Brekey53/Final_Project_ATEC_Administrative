import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FotoPlaceholder from "../../img/avatar.png";

import {
  getUtilizador,
  updateUtilizador,
} from "../../services/users/UserService";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    nif: "",
    telefone: "",
    IdTipoUtilizador: 0,
    dataNascimento: "",
    sexo: "Masculino",
    morada: "",
    fotografia: null as File | null,
    documento: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fotoPreview, setFotoPreview] = useState<string>(FotoPlaceholder);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await getUtilizador(id);
        const u = res;
        setFormData({
          email: u.email ?? "",
          nome: u.nome ?? "",
          nif: u.nif ?? "",
          telefone: u.telefone ?? "",
          IdTipoUtilizador: Number(u.idTipoUtilizador),
          dataNascimento: u.dataNascimento?.split("T")[0] ?? "",
          sexo: u.sexo,
          morada: u.morada ?? "",
          fotografia: null,
          documento: null,
        });

        if (u.fotografia) {
          setFotoPreview(u.fotografia);
        }

        if (u.anexoFicheiro) {
          setDocumentPreview(u.anexoFicheiro);
        }
      } catch (err: any) {
        toast.error(
          err.response?.data?.message ||
            "Erro ao carregar dados do utilizador.",
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

    setFormData({
      ...formData,
      [name]: name === "IdTipoUtilizador" ? Number(value) : value,
    });
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
    data.append("Nome", formData.nome);
    data.append("Nif", formData.nif);
    data.append("Telefone", formData.telefone);
    data.append("IdTipoUtilizador", formData.IdTipoUtilizador.toString());
    data.append("DataNascimento", formData.dataNascimento);
    data.append("Sexo", formData.sexo);
    data.append("Morada", formData.morada);

    // Ficheiros: Só anexar se forem novos (instância de File)
    if (formData.fotografia instanceof File) {
      data.append("Fotografia", formData.fotografia);
    }
    if (formData.documento instanceof File) {
      data.append("Documento", formData.documento);
    }

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
