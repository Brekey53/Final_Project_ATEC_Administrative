import { useEffect, useState } from "react";
import { getMyPerfil, type Perfil } from "../services/users/PerfilService";
import { getFotoPerfil } from "../services/users/PerfilService";
import FotoPlaceholder from "../img/avatar.png";
import toast from "react-hot-toast";
import "../css/perfil.css";
import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export default function Perfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

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

  useEffect(() => {
    async function loadFoto() {
      try {
        const url = await getFotoPerfil();
        setFotoUrl(url);
      } catch {
        setFotoUrl(null);
      }
    }

    loadFoto();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("Preencha todos os campos");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("As passwords não coincidem");
        return;
      }
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Password alterada com sucesso");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao alterar password");
    } finally {
      setLoading(false);
    }
  }

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
              src={fotoUrl ?? FotoPlaceholder}
              alt="Foto de perfil"
              className="img-fluid rounded mb-3"
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />

            <button className="btn btn-outline-secondary btn-sm" disabled>
              Alterar fotografia
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
            
            {/* DADOS ESPECÍFICOS */}
            {perfil.tipo === 2 && (
              <>
                <h5 className="text-primary mb-3">Dados de Formador</h5>

                {perfil.iban && (
                  <div className="mb-3">
                    <label className="form-label">IBAN</label>
                    <input
                      className="form-control"
                      value={perfil.iban}
                      disabled
                    />
                  </div>
                )}

                {perfil.qualificacoes && (
                  <div className="mb-3">
                    <label className="form-label">Qualificações</label>
                    <textarea
                      className="form-control"
                      value={perfil.qualificacoes}
                      disabled
                    />
                  </div>
                )}
              </>
            )}

            {perfil.tipo === 3 && (
              <>
                <div className="mb-3">
                  <label className="form-label">ID do Formando</label>
                  <input
                    className="form-control"
                    value={perfil.idFormando}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Escolaridade</label>
                  <input
                    className="form-control"
                    value={perfil.escolaridade}
                    disabled
                  />
                </div>
              </>
            )}

            <hr />

            <div className="d-flex justify-content-end">
              <button
                className="btn btn-success"
                onClick={() => setShowPasswordModal(true)}
              >
                Alterar password
              </button>
            </div>
          </div>
          {showPasswordModal && (
            <>
              <div
                className="custom-modal-overlay"
                onClick={() => setShowPasswordModal(false)}
              />

              <div className="custom-modal">
                <div className="custom-modal-header">
                  <h5>Alterar palavra-passe</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowPasswordModal(false)}
                  />
                </div>

                <form
                  onSubmit={handleChangePassword}
                  className="d-flex flex-column gap-3 mt-4"
                >
                  <div className="form-group">
                    <label className="form-label">Password atual:</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nova Password:</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirmar Password:</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="showPass"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    <label
                      className="form-check-label text-muted"
                      htmlFor="showPass"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Mostrar palavra-passe
                    </label>
                  </div>

                  <button className="btn btn-primary" disabled={loading}>
                    {loading ? "A processar..." : "Alterar Password"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
