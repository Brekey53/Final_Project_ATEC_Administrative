import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Register } from "../../auth/ResgisterService";
import toast from "react-hot-toast";

export default function CreateAccount() {
  const navigate = useNavigate();

  // Estados alinhados com o DTO
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [nif, setNif] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordStrong = (pass: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(pass);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As passwords não coincidem");
      return;
    }

    if (!isPasswordStrong(password)) {
      toast.error(
        "A password deve ter pelo menos 6 caracteres, incluindo uma letra e um número.",
      );
      return;
    }

    setLoading(true);

    try {
      // Objeto formatado para o C# (as chaves devem bater com o DTO ou o JSON da API)
      const registerData = {
        Email: email,
        Password: password,
        Nome: name,
        Nif: nif,
        DataNascimento: birthDate,
      };

      await Register(registerData);
      toast.success(
        "Registado com sucesso! Verifique o seu email para ativar a conta.",
      );
      navigate("/Login", { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="credentials-login">
      <div className="modal-login">
        <Link to="/login" className="btn btn-link mb-3">
          <button className="btn text-muted rounded-3">← Voltar</button>
        </Link>

        <h2 className="text-center">Criar Conta</h2>

        <form
          className="d-flex flex-column justify-content-center mt-4"
          onSubmit={handleSubmit}
        >
          {/* Nome Completo */}
          <div className="mb-3">
            <label className="form-label">
              Nome Completo <span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="row">
            {/* NIF */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                NIF <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                maxLength={9}
                required
              />
            </div>

            {/* Data Nascimento */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Data de Nascimento <span className="required-star">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">
              Email <span className="required-star">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">
              Password <span className="required-star">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirmar Password */}
          <div className="mb-2">
            <label className="form-label">
              Repita Password <span className="required-star">*</span>
            </label>
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

          <button className="btn btn-primary py-2 fw-bold" disabled={loading}>
            {loading ? "A registar..." : "Criar Conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
