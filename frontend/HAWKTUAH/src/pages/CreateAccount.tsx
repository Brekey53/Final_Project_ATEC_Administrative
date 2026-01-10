import React from 'react'
import { Link } from 'react-router-dom'

export default function CreateAccount() {
  return (
    <div className="credentials-login">
      <div className="modal-login">
        <Link to="/login" className="btn btn-link mb-3">
          ← Voltar
        </Link>

        <h2 className="text-center">
          Insira os seus dados
        </h2>

        <form className="d-flex flex-column justify-content-center mt-4">
          <div className="mb-3">
            <label className="form-label">Nome <span className='required-star'>*</span></label>
            <input type="text" className="form-control" required/>
          </div>
          <div className="mb-3">
            <label className="form-label">Email <span className='required-star'>*</span></label>
            <input type="email" className="form-control" required/>
          </div>
          <div className="mb-3">
            <label className="form-label">Password <span className='required-star'>*</span></label>
            <input type="password" className="form-control" required/>
          </div>
          <div className="mb-3">
            <label className="form-label">Repita Password <span className='required-star'>*</span></label>
            <input type="password" className="form-control" required/>
          </div>

          <button className="btn btn-primary">
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
