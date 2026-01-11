import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Register } from "../auth/ResgisterService";


export default function CreateAccount() {

  const navigate = useNavigate();
  const [name, setName] = useState("");
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
        setLoading(false);
        return;
      }
  
      try {
        await Register(name, email, password);
        alert("Registado com sucesso, verifique o seu email!");
        navigate("/Login", { replace: true });
      } catch (err: any) {
        setError(err.mensagem);
      } finally {
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
          <div className="mb-3">
            <label className="form-label">Nome <span className='required-star'>*</span></label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required/>
          </div>
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
            {loading ? "A registar..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  )
}
