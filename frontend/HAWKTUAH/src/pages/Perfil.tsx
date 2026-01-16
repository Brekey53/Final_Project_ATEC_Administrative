import { useEffect, useState } from "react";
import { getMyPerfil, type Perfil } from "../services/PerfilService";
import FotoPlaceholder from "../img/avatar.png";
import toast from "react-hot-toast";

export default function Perfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const data = await getMyPerfil();
        setPerfil(data);
      } catch {
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    }

    fetchPerfil();
  }, []);

  if (loading) {
    return <div className="container mt-5">A carregar perfil...</div>;
  }

  if (!perfil) {
    return <div className="container mt-5">Perfil não encontrado</div>;
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-bold">O meu perfil</h2>

      <div className="row">
        {/* FOTO */}
        <div className="col-lg-4 text-center mb-4">
          <div className="card p-3 shadow-sm">
            <img
              src={FotoPlaceholder}
              alt="Foto de perfil"
              className="img-fluid rounded mb-3"
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />

            <button className="btn btn-outline-secondary btn-sm" disabled>
              Alterar fotografia (brevemente)
            </button>
          </div>
        </div>

        {/* DADOS */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm">
            <h5 className="text-primary mb-3">Dados pessoais</h5>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={perfil.email}
                  disabled
                />
              </div>

              {perfil.nome && (
                <div className="col-md-12 mb-3">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.nome}
                    disabled
                  />
                </div>
              )}

              {perfil.nif && (
                <div className="col-md-4 mb-3">
                  <label className="form-label">NIF</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.nif}
                    disabled
                  />
                </div>
              )}

              {perfil.sexo && (
                <div className="col-md-4 mb-3">
                  <label className="form-label">Sexo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.sexo}
                    disabled
                  />
                </div>
              )}

              {perfil.dataNascimento && (
                <div className="col-md-4 mb-3">
                  <label className="form-label">Data de nascimento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={perfil.dataNascimento.split("T")[0]}
                    disabled
                  />
                </div>
              )}

              {perfil.telefone && (
                <div className="col-md-6 mb-3">
                  <label className="form-label">Telefone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.telefone}
                    disabled
                  />
                </div>
              )}

              {perfil.morada && (
                <div className="col-md-12 mb-3">
                  <label className="form-label">Morada</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.morada}
                    disabled
                  />
                </div>
              )}
            </div>

            <hr />

            <div className="d-flex justify-content-end">
              <button
                className="btn btn-warning"
                onClick={() => toast("Funcionalidade em breve")}
              >
                Alterar password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
