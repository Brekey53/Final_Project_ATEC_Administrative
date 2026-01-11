import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Google from "../img/google.png";
import Facebook from "../img/facebook.jpg";
import { Register } from "../auth/ResgisterService";
import { API_BASE_URL } from "../config.constants";

export default function CreateAccount() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError("");
      setLoading(true);

      if (password !== confirmPassword) {
        setError("As passwords não coincidem");
        return;
      }
  
      try {
        await Register(email, password);
        navigate("/Login", { replace: true });
      } catch (err) {
        setError("Email ou password inválidos");
      } finally {
        alert("Registado com sucesso!");
        setLoading(false);
      }
    }


  return (
    <div className="credentials-login">
      <div className="modal-login">
        <Link to="/login" className="btn btn-link mb-3">
        <button className='btn text-muted rounded-3'>← Voltar</button>
          
        </Link>

        <h2 className="text-center">
          Insira os seus dados
        </h2>

        <form className="d-flex flex-column justify-content-center mt-4" onSubmit={handleSubmit}>
          {/*TODO: Comentado porque não é necessario colocar nome no registo, ALTERAMOS O REGISTO??
          <div className="mb-3">
            <label className="form-label">Nome <span className='required-star'>*</span></label>
            <input type="text" className="form-control" required/>
          </div>
          */}
          <div className="mb-3">
            <label className="form-label">Email <span className='required-star'>*</span></label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>
          <div className="mb-3">
            <label className="form-label">Password <span className='required-star'>*</span></label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </div>
          <div className="mb-3">
            <label className="form-label">Repita Password <span className='required-star'>*</span></label>
            <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Conta Registada com sucesso..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  )
}
