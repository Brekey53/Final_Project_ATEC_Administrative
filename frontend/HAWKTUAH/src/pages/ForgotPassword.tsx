import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="credentials-login">
      <div className="modal-login">
        <Link to="/login" className="btn btn-link mb-3">
          ← Voltar
        </Link>

        <h2 className="text-center">
          Insira o email para reiniciar a password
        </h2>

        <form className="d-flex flex-column justify-content-center mt-4">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" />
          </div>

          <button className="btn btn-primary">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
