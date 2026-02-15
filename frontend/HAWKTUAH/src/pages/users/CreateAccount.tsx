import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreateAccountNewUser } from "../../services/users/CreateAccountNewUser";
import toast from "react-hot-toast";
import { get1900ISO, getHojeISO } from "../../utils/dataUtils";

export default function CreateAccount() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nif, setNif] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sexo, setSexo] = useState("Masculino");
  const [morada, setMorada] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordStrong = (pass: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!.%*?&]{6,}$/;
    return regex.test(pass);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As passwords não coincidem", { id: "erro-passwords" });
      return;
    }

    if (!isPasswordStrong(password)) {
      toast.error(
        "A password deve ter pelo menos 6 caracteres, incluindo uma letra e um número, alguns caracteres especiais podem não ser aceites!",
        { id: "erro-password-inválida" },
      );
      return;
    }

    if (birthDate < get1900ISO() || birthDate > getHojeISO()) {
      toast.error("Introduza uma data de nascimento válida.", {
        id: "erro-data-nascimento",
      });
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        Email: email,
        Password: password,
        Nome: name,
        Nif: nif,
        DataNascimento: birthDate,
        Telefone: telefone,
        Sexo: sexo,
        Morada: morada,
      };
      await CreateAccountNewUser(registerData);
      toast.success(
        "Registado com sucesso! Verifique o seu email para ativar a conta.",
      );
      navigate("/Login", { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar conta.", {
        id: "erro-criar-contacerto",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="credentials-login">
      <div className="modal-login">
        <Link to="/login" className="btn btn-light border">
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
              minLength={8}
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
                minLength={9}
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
                max={getHojeISO()}
                required
              />
            </div>
          </div>

          <div className="row">
            {/* Telefone */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Telefone <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                minLength={9}
                maxLength={9}
                required
              />
            </div>

            {/* SEXO */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Sexo <span className="required-star">*</span>
              </label>
              <select
                className="form-label form-select"
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>
          </div>

          {/* Morada */}
          <div className="mb-3">
            <label className="form-label">
              Morada <span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={morada}
              onChange={(e) => setMorada(e.target.value)}
              required
            />
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
