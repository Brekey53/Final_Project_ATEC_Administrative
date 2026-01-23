import { authService } from "../../auth/AuthService";
import { Link } from "react-router-dom"

export default function FormadorDashboard() {
  const user = authService.decodeToken();
  if (!user) return null;

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="mb-1">
            Bem-vindo, <strong>{user.email}</strong>
          </h3>
          <small className="text-muted">
            Aqui está o resumo da tua atividade
          </small>
        </div>

        <button className="btn btn-success">+ Adicionar disponibilidade</button>
      </div>

      {/* Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Horas dadas este mês</h6>
              {/*TODO: IMPLEMENTAR BACKEND AQUI */}
              <h3 className="mb-0">32h</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Horas dadas mês passado</h6>
              {/*TODO: IMPLEMENTAR BACKEND AQUI */}
              <h3 className="mb-0">28h</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Horário semanal */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Horário desta semana</h5>

          <div className="text-muted">
            {/*TODO: IMPLEMENTAR BACKEND AQUI , GET SEMANAL ?*/}
            Segunda a Sexta · 09:00 – 17:00
          </div>
        </div>
      </div>
    </div>
  );
}
